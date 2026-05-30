import calcIndex from './calc-compute-index.json';

// ─────────────────────────────────────────────────────────────────────────────
// Núcleo compartido de cómputo de calculadoras. Lo usan tanto el endpoint REST
// (/api/calc/[slug]/compute.ts) como el servidor MCP (/mcp.ts), para no duplicar
// la lógica ni cargar las fórmulas dos veces.
//
// CRÍTICO — tamaño del Worker: el lazy glob de fórmulas vive ACÁ (1 chunk por
// fórmula, on-demand). NUNCA importar formulas/index.ts (eager = todo el bundle)
// ni globear los JSON de calcs (eager = ~21 MiB). Ver search-index.json.ts.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = 'https://hacecuentas.com';
export const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
export const DISCLAIMER =
  'Resultado orientativo con fines educativos. Verificá con fuentes oficiales antes de tomar decisiones.';

export interface SlimField {
  id: string;
  t: string;
  fmt?: string;
  r?: 1;
  def?: string;
  o?: string[];
}
export interface SlimEntry {
  f: string;
  h?: string;
  cat?: string;
  aud?: string;
  loc?: string; // locale (es, en, es-MX, pt-BR, ...)
  p?: string; // path prefix de la URL pública (en/, mx/, ...); ausente = root ES
  fields: SlimField[];
}

export const index = calcIndex as Record<string, SlimEntry>;

export function getEntry(slug: string): SlimEntry | undefined {
  return index[slug];
}

// locale de la colección (es-MX, pt-BR, en, ...) → idioma base de los strings de
// la fórmula (es|en|pt). Las fórmulas i18n leen i.__lang; el resto lo ignora.
export function localeToLang(loc?: string): string {
  const base = (loc || 'es').toLowerCase().split('-')[0];
  return base === 'en' || base === 'pt' ? base : 'es';
}

// URL pública del calc, respetando el prefijo de locale (/en/slug, /mx/slug, ...).
export function calcUrl(slug: string): string {
  return `${SITE}/${index[slug]?.p ?? ''}${slug}`;
}

// Lazy: 1 chunk por fórmula. Path relativo a src/lib/ → src/lib/formulas/*.ts
const formulaLoaders = import.meta.glob<any>('./formulas/*.ts');
const formulaCache = new Map<string, Function>();

export async function loadFormula(formulaId: string): Promise<Function | null> {
  if (formulaCache.has(formulaId)) return formulaCache.get(formulaId)!;
  const loader = formulaLoaders[`./formulas/${formulaId}.ts`];
  if (!loader) return null;
  const mod: any = await loader();
  const fnKey = Object.keys(mod).find((k) => typeof mod[k] === 'function');
  if (!fnKey) return null;
  formulaCache.set(formulaId, mod[fnKey]);
  return mod[fnKey];
}

// Coercion: espejo de getFormFieldValue / runWhatIfNow de Calculator.astro.
export function coerce(field: SlimField, raw: unknown): string | number | boolean {
  const s = String(raw);
  if (field.t === 'number') {
    if (field.fmt === 'thousands') {
      const n = Number(s.replace(/\./g, '').replace(/,/g, '.')); // es-AR: "." miles, "," decimal
      return isNaN(n) ? s : n;
    }
    const n = Number(s);
    return s !== '' && !isNaN(n) ? n : s;
  }
  if (field.t === 'boolean') {
    return s === 'true' || s === '1' || s === 'on' || s === 'yes';
  }
  return s; // select | radio | date | datetime-local | text | textarea
}

export function cleanOutput(out: any): any {
  if (out == null || typeof out !== 'object') return out;
  const clean: Record<string, any> = {};
  for (const k of Object.keys(out)) {
    if (k.startsWith('_')) continue; // _chart, _path, etc. (solo front)
    clean[k] = out[k];
  }
  return clean;
}

export type ComputeOk = {
  ok: true;
  slug: string;
  formulaId: string;
  h1?: string;
  category?: string;
  audience?: string;
  locale: string;
  inputs: Record<string, any>;
  result: any;
};
export type ComputeErr = {
  ok: false;
  status: 400 | 404 | 422 | 501;
  error: string;
  message: string;
  missingFields?: string[];
  requiredFields?: string[];
};

/**
 * Corre una calculadora. Devuelve un resultado estructurado; el caller (REST o
 * MCP) arma el envelope/headers. No tira excepciones: los errores de la fórmula
 * se devuelven como ComputeErr.
 */
export async function runCompute(
  slug: string,
  provided: Record<string, unknown>,
  lang?: string,
): Promise<ComputeOk | ComputeErr> {
  const entry = index[slug];
  if (!entry) {
    return {
      ok: false,
      status: 404,
      error: 'calc_not_found',
      message: `No existe una calculadora con slug "${slug}". Mirá el catálogo en ${SITE}/api/calcs-index.json`,
    };
  }

  const inputs: Record<string, string | number | boolean> = {};
  const missing: string[] = [];
  for (const field of entry.fields) {
    const got = provided[field.id];
    const hasValue = got !== undefined && got !== null && String(got) !== '';
    if (hasValue) inputs[field.id] = coerce(field, got);
    else if (field.r) missing.push(field.id);
    else if (field.def !== undefined) inputs[field.id] = coerce(field, field.def);
  }

  if (missing.length) {
    return {
      ok: false,
      status: 400,
      error: 'missing_required_fields',
      message: `Faltan campos obligatorios: ${missing.join(', ')}.`,
      missingFields: missing,
      requiredFields: entry.fields.filter((f) => f.r).map((f) => f.id),
    };
  }

  // Idioma de los strings del resultado: el explícito del caller si vino, si no el
  // del locale del calc (un calc /en/* o /pt/* responde en su idioma por default).
  const effLang = lang && lang.trim() ? lang.trim() : localeToLang(entry.loc);
  (inputs as any).__lang = effLang; // las fórmulas leen i.__lang; las que no, lo ignoran

  const fn = await loadFormula(entry.f);
  if (!fn) {
    return { ok: false, status: 501, error: 'formula_unavailable', message: 'La fórmula no está disponible.' };
  }

  let result: any;
  try {
    result = fn(inputs);
  } catch (err: any) {
    return {
      ok: false,
      status: 422,
      error: 'computation_error',
      message: err?.message || 'No se pudo calcular con esos valores.',
    };
  }

  const { __lang, ...cleanInputs } = inputs as any;
  return {
    ok: true,
    slug,
    formulaId: entry.f,
    h1: entry.h,
    category: entry.cat,
    audience: entry.aud,
    locale: effLang,
    inputs: cleanInputs,
    result: cleanOutput(result),
  };
}

export function buildMeta(slug: string, computedAt: string) {
  const url = calcUrl(slug); // URL pública con prefijo de locale (/en/, /mx/, ...)
  return {
    calculator: url,
    spec: `${SITE}/api/calc/${slug}.json`,
    source: 'Hacé Cuentas',
    license: LICENSE,
    attribution: `Hacé Cuentas — ${url}`,
    disclaimer: DISCLAIMER,
    computedAt,
  };
}

// ── Helpers para el servidor MCP ─────────────────────────────────────────────

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // sacar acentos (combining marks)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export interface SearchHit {
  slug: string;
  name: string;
  category?: string;
  audience?: string;
  url: string;
  spec: string;
  compute: string;
}

/** Busca en el índice por tokens contra h1 + slug. Devuelve top-N ordenado por score. */
export function searchCalcs(query: string, opts: { category?: string; limit?: number } = {}): SearchHit[] {
  const limit = Math.min(opts.limit ?? 10, 50);
  const qts = tokens(query || '');
  const qJoined = qts.join('');
  const cat = opts.category?.toLowerCase();
  const scored: Array<{ slug: string; e: SlimEntry; score: number }> = [];

  for (const slug of Object.keys(index)) {
    const e = index[slug];
    if (cat && (e.cat || '').toLowerCase() !== cat) continue;
    const hayTokens = tokens(`${e.h || ''} ${slug}`);
    let score = 0;
    if (qts.length === 0) {
      score = 1; // sin query: devolver cualquiera (útil para listar por categoría)
    } else {
      for (const qt of qts) {
        if (hayTokens.includes(qt)) score += 2;
        else if (hayTokens.some((h) => h.includes(qt))) score += 1;
      }
      // Bonus si la query entera aparece como token (ej. "imc" matchea calculadora-IMC fuerte).
      if (qJoined && hayTokens.includes(qJoined)) score += 2;
    }
    if (score > 0) scored.push({ slug, e, score });
  }

  // Orden: score desc → slug más corto (menos segmentos = más canónico/general) → alfabético.
  scored.sort((a, b) => b.score - a.score || a.slug.length - b.slug.length || a.slug.localeCompare(b.slug));
  return scored.slice(0, limit).map(({ slug, e }) => ({
    slug,
    name: e.h || slug,
    category: e.cat,
    audience: e.aud,
    url: `${SITE}/${e.p ?? ''}${slug}`,
    spec: `${SITE}/api/calc/${slug}.json`,
    compute: `${SITE}/api/calc/${slug}/compute`,
  }));
}

/** Ficha liviana de una calc para el MCP (desde el índice slim). */
export function describeCalc(slug: string) {
  const e = index[slug];
  if (!e) return null;
  const example: Record<string, string> = {};
  for (const f of e.fields) if (f.def !== undefined) example[f.id] = f.def;
  const qs = Object.entries(example)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return {
    slug,
    name: e.h || slug,
    category: e.cat,
    audience: e.aud,
    locale: e.loc || 'es',
    formulaId: e.f,
    url: `${SITE}/${e.p ?? ''}${slug}`,
    inputs: e.fields.map((f) => ({
      id: f.id,
      type: f.t,
      required: !!f.r,
      ...(f.def !== undefined ? { default: f.def } : {}),
      ...(f.o ? { options: f.o } : {}),
    })),
    exampleComputeUrl: qs ? `${SITE}/api/calc/${slug}/compute?${qs}` : `${SITE}/api/calc/${slug}/compute`,
    spec: `${SITE}/api/calc/${slug}.json`,
  };
}
