/**
 * Utilidades puras para construir y auditar el grafo combinado de redirects.
 *
 * Hay dos fuentes:
 *   - PRUNING_REDIRECTS, embebida sólo en el Worker.
 *   - public/_redirects, cuya regla exacta tiene precedencia.
 *
 * El Worker nunca debe publicar el grafo crudo: un destino que también sea
 * source produciría A -> B -> C. `flattenRedirectGraph()` conserva el status
 * declarado por A, pero cambia su destino a C. Los ciclos son siempre fatales.
 */

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export class RedirectCycleError extends Error {
  constructor(cycles) {
    const rendered = cycles.map((cycle) => cycle.join(' -> ')).join('; ');
    super(`Ciclo(s) de redirects detectado(s): ${rendered}`);
    this.name = 'RedirectCycleError';
    this.cycles = cycles;
  }
}

/** Parse de reglas exactas de Cloudflare Pages. Los patterns quedan en Assets. */
export function parseCloudflareRedirects(text) {
  const entries = [];
  const ignored = [];

  for (const [zeroIndex, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 2 || !parts[0].startsWith('/')) continue;

    const [source, destination] = parts;
    const parsedStatus = parts[2] === undefined ? 301 : Number.parseInt(parts[2], 10);
    const status = Number.isFinite(parsedStatus) ? parsedStatus : 301;
    const isPattern =
      source.includes('*') ||
      source.includes(':') ||
      destination.includes(':') ||
      !destination.startsWith('/');

    if (isPattern) {
      ignored.push({ source, destination, status, line: zeroIndex + 1 });
      continue;
    }
    if (!REDIRECT_STATUSES.has(status)) {
      ignored.push({ source, destination, status, line: zeroIndex + 1 });
      continue;
    }

    entries.push({
      source,
      destination,
      status,
      origin: '_redirects',
      line: zeroIndex + 1,
    });
  }

  return { entries, ignored };
}

/** Parse deliberadamente acotado al Record<string,string> generado. */
export function parsePruningRedirects(text) {
  const entries = [];
  const entryRe = /(['"])(\/[^'"]+)\1\s*:\s*(['"])(\/[^'"]*)\3/g;
  let match;
  while ((match = entryRe.exec(text)) !== null) {
    entries.push({
      source: match[2],
      destination: match[4],
      status: 301,
      origin: 'pruning',
    });
  }
  return entries;
}

/**
 * Combina fuentes con la misma precedencia histórica del Worker:
 * PRUNING_REDIRECTS primero y las reglas exactas de _redirects después.
 */
export function combineRedirectEntries(pruningEntries, staticEntries) {
  const map = new Map();
  const overlaps = [];

  for (const entry of [...pruningEntries, ...staticEntries]) {
    const previous = map.get(entry.source);
    if (previous) {
      overlaps.push({
        source: entry.source,
        previous,
        winner: entry,
        conflict:
          previous.destination !== entry.destination || previous.status !== entry.status,
      });
    }
    map.set(entry.source, { ...entry });
  }

  return { map, overlaps };
}

function canonicalCycle(cycle) {
  const body = cycle.slice(0, -1);
  if (body.length === 0) return '';
  let best = body;
  for (let index = 1; index < body.length; index++) {
    const rotated = [...body.slice(index), ...body.slice(0, index)];
    if (rotated.join('\0') < best.join('\0')) best = rotated;
  }
  return [...best, best[0]].join('\0');
}

/**
 * Resuelve todos los destinos internos de forma transitiva.
 *
 * Retorna tanto el mapa aplanado como las cadenas originales para auditoría.
 * Si existe al menos un ciclo no retorna un mapa parcial: arroja un error.
 */
export function flattenRedirectGraph(rawMap) {
  const resolved = new Map();
  const resolving = [];
  const resolvingIndex = new Map();
  const cyclesByKey = new Map();

  function resolveSource(source) {
    const cached = resolved.get(source);
    if (cached) return cached;

    const cycleAt = resolvingIndex.get(source);
    if (cycleAt !== undefined) {
      const cycle = [...resolving.slice(cycleAt), source];
      const key = canonicalCycle(cycle);
      cyclesByKey.set(key, key.split('\0'));
      return null;
    }

    const entry = rawMap.get(source);
    if (!entry) return { finalDestination: source, path: [source] };

    resolvingIndex.set(source, resolving.length);
    resolving.push(source);

    let result;
    if (rawMap.has(entry.destination)) {
      const downstream = resolveSource(entry.destination);
      result = downstream
        ? {
            finalDestination: downstream.finalDestination,
            path: [source, ...downstream.path],
          }
        : null;
    } else {
      result = {
        finalDestination: entry.destination,
        path: [source, entry.destination],
      };
    }

    resolving.pop();
    resolvingIndex.delete(source);
    if (result) resolved.set(source, result);
    return result;
  }

  for (const source of rawMap.keys()) resolveSource(source);

  const cycles = [...cyclesByKey.values()].sort((a, b) =>
    a.join('\0').localeCompare(b.join('\0')),
  );
  if (cycles.length > 0) throw new RedirectCycleError(cycles);

  const flattened = new Map();
  const chains = [];
  for (const [source, entry] of rawMap) {
    const resolution = resolved.get(source);
    if (!resolution) continue;
    flattened.set(source, {
      ...entry,
      destination: resolution.finalDestination,
    });
    if (resolution.path.length > 2) {
      chains.push({
        source,
        originalDestination: entry.destination,
        finalDestination: resolution.finalDestination,
        hops: resolution.path.length - 1,
        path: resolution.path,
      });
    }
  }

  chains.sort((a, b) => a.source.localeCompare(b.source));
  return { flattened, chains };
}

/** Convierte el Map a la forma compacta que se inyecta en wrapper.mjs. */
export function toWorkerRedirectMap(flattened) {
  return Object.fromEntries(
    [...flattened].map(([source, entry]) => [
      source,
      { d: entry.destination, s: entry.status },
    ]),
  );
}

/**
 * Clasifica problemas semánticos una vez aplanado el grafo.
 *
 * `targetMetadata` es deliberadamente genérico para que el lector de contenido
 * viva en el CLI y esta función siga siendo pura/testeable:
 *   { file, canonicalTarget, nonDistributableReasons, expectedStatic }
 *
 * `builtPages`, cuando se provee, contiene:
 *   { file, canonicalPath, noindex }
 */
export function auditFlattenedRedirects({
  rawMap,
  flattened,
  gonePaths = new Set(),
  indexedPaths = new Set(),
  targetMetadata = new Map(),
  categoryAvailability = new Map(),
  builtPages = null,
}) {
  const sourceGoneConflicts = [];
  const retiredTargetIssues = [];
  const canonicalTargetIssues = [];
  const invalidTargetIssues = [];
  const nonDistributableTargetIssues = [];

  for (const [source, entry] of rawMap) {
    if (!gonePaths.has(source)) continue;
    sourceGoneConflicts.push({
      source,
      target: entry.destination,
      status: entry.status,
      origin: entry.origin,
      reasons: ['source presente simultáneamente en GONE_410_URLS y redirects'],
    });
  }

  for (const [source, entry] of flattened) {
    const target = entry.destination;
    const metadata = targetMetadata.get(target);
    const nonDistributableReasons = metadata?.nonDistributableReasons || [];
    const canonicalTarget = metadata?.canonicalTarget;
    const retired = gonePaths.has(target);

    if (retired) {
      retiredTargetIssues.push({
        source,
        target,
        reasons: ['destino presente en GONE_410_URLS'],
      });
    }

    let hasCanonicalIssue = false;
    if (canonicalTarget && canonicalTarget !== target) {
      hasCanonicalIssue = true;
      canonicalTargetIssues.push({
        source,
        target,
        canonicalTarget,
        file: metadata?.file,
        reasons: [`canonicalSlug apunta a ${canonicalTarget}`],
      });
    }

    if (nonDistributableReasons.length > 0) {
      nonDistributableTargetIssues.push({
        source,
        target,
        file: metadata?.file,
        reasons: nonDistributableReasons,
      });
    }

    const invalidReasons = [];
    const categoryMatch = target.match(/^\/categoria\/([^/]+)$/);
    if (categoryMatch && (categoryAvailability.get(categoryMatch[1]) || 0) === 0) {
      invalidReasons.push('hub de categoría vacío (0 calculadoras distribuibles)');
    }

    const built = builtPages?.get(target);
    // Un noindex de calc ya está inventariado como deuda opcional. Para hubs y
    // otras páginas sí es un destino fatal: concentra señales en una URL que
    // explícitamente pide no ser indexada.
    if (built?.noindex && nonDistributableReasons.length === 0) {
      invalidReasons.push('HTML compilado declara noindex');
    }
    if (
      built?.canonicalPath &&
      built.canonicalPath !== target &&
      !hasCanonicalIssue
    ) {
      hasCanonicalIssue = true;
      canonicalTargetIssues.push({
        source,
        target,
        canonicalTarget: built.canonicalPath,
        file: built.file,
        reasons: [`rel=canonical apunta a ${built.canonicalPath}`],
      });
    }
    if (builtPages && metadata?.expectedStatic && !built) {
      invalidReasons.push('destino prerender esperado pero ausente de dist/client');
    }

    const alreadyExplained =
      retired ||
      hasCanonicalIssue ||
      nonDistributableReasons.length > 0 ||
      invalidReasons.length > 0;
    if (!indexedPaths.has(target) && !alreadyExplained) {
      invalidReasons.push(
        'destino ausente de los sitemaps indexados (inexistente, noindex o hub vacío)',
      );
    }

    if (invalidReasons.length > 0) {
      invalidTargetIssues.push({
        source,
        target,
        file: built?.file || metadata?.file,
        reasons: invalidReasons,
      });
    }
  }

  const bySource = (a, b) =>
    a.source.localeCompare(b.source) || a.target.localeCompare(b.target);
  sourceGoneConflicts.sort(bySource);
  retiredTargetIssues.sort(bySource);
  canonicalTargetIssues.sort(bySource);
  invalidTargetIssues.sort(bySource);
  nonDistributableTargetIssues.sort(bySource);

  return {
    sourceGoneConflicts,
    retiredTargetIssues,
    canonicalTargetIssues,
    invalidTargetIssues,
    nonDistributableTargetIssues,
  };
}
