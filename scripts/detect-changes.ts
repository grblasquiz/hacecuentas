/**
 * Detect changes since last successful deploy.
 *
 * Lee LAST_DEPLOY_SHA (env) y compara contra HEAD via `git diff`. Clasifica
 * cada archivo cambiado en una de tres categorías:
 *
 *   1. shared  → archivo que afecta múltiples páginas (Layout, Calculator,
 *                astro.config, package.json, etc.). Output: mode=full.
 *   2. calcs   → src/content/calcs(-loc)/X.json o src/lib/formulas/X.ts.
 *                Output: mode=incremental + lista de slugs + locales.
 *   3. ignore  → docs/, *.md, cerebro/, workflows que no afectan build.
 *                No suma al modo, se skipea.
 *
 * Si LAST_DEPLOY_SHA no está seteado o el diff falla → mode=full (seguro).
 *
 * Output: escribe key=value lines a $GITHUB_OUTPUT (o stdout en local).
 */

import { execSync } from 'node:child_process';
import { appendFileSync, readFileSync, existsSync } from 'node:fs';

const LAST_SHA = process.env.LAST_DEPLOY_SHA || '';

// Patrones que disparan FULL rebuild si tocan estos archivos. Diseñado defensivo:
// ante la duda, full rebuild. Es mejor un build largo de más que un deploy roto.
const SHARED_PATTERNS: RegExp[] = [
  /^src\/components\//,
  /^src\/layouts\//,
  // src/lib EXCEPTO formulas/<slug>.ts (esos son específicos del calc)
  /^src\/lib\/(?!formulas\/[^/]+\.ts$)/,
  /^src\/styles\//,
  // src/pages/* excepto los content endpoints que no participan del prerender
  // de calcs (sitemap, rss, feed). Sin embargo, defensivo: si tocaron pages,
  // full rebuild — los pages estructuran TODO el sitio.
  /^src\/pages\//,
  /^src\/middleware/,
  /^src\/env\.d\.ts$/,
  /^astro\.config\./,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^wrangler\./,
  // Scripts de build/prebuild — si cambian, full rebuild
  /^scripts\/(?!new-calc\.ts$|cf-purge-cache\.sh$|detect-changes\.ts$|incremental-purge\.ts$)/,
  /^public\//,
  /^tsconfig\.json$/,
  /^\.github\/workflows\/deploy\.yml$/,
  // Otros content types que NO son calcs JSON
  /^src\/content\/(blog|guias|tablas|comparaciones|glosario|argentina|iibb)\//,
];

// Patrones que SE PUEDEN ignorar (no afectan build de prod).
const IGNORE_PATTERNS: RegExp[] = [
  /^docs\//,
  /^cerebro\//,
  /^audits\//,
  /^reports\//,
  /\.md$/,
  /^\.githooks\//,
  /^\.vscode\//,
  // Otros workflows (no deploy.yml) son crons que no afectan prod
  /^\.github\/workflows\/(?!deploy\.yml).+\.yml$/,
  /^\.github\/(?!workflows\/).+/,
  // OG cache (se regenera con caches del workflow)
  /^public\/og\//,
  /^public\/search-index\.json$/,
  /^public\/sw\.js$/,
  // Manifests autogenerados
  /^src\/lib\/og-manifest\.json$/,
  /^src\/lib\/related-auto\.(json|hash)$/,
];

// Calcs JSON: src/content/calcs/X.json (AR) o src/content/calcs-XX/X.json (locale)
// X puede ser el slug O el formulaId — convención mixta histórica. El slug real
// está dentro del JSON, hay que leerlo.
const CALC_JSON_RE = /^src\/content\/calcs(-([a-z]{2}))?\/([^/]+)\.json$/;
const FORMULA_TS_RE = /^src\/lib\/formulas\/([^/]+)\.ts$/;

function readSlugFromJson(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data.slug || null;
  } catch {
    return null;
  }
}

function readSlugFromFormulaId(formulaId: string): string[] {
  // Una fórmula puede pertenecer a varios calcs (varios locales). Escaneamos
  // los content/calcs* directories para encontrar los que tienen este formulaId.
  const locales = ['', 'en', 'es', 'mx', 'cl', 'co', 'pt'];
  const slugs = new Set<string>();
  for (const loc of locales) {
    const dir = loc ? `src/content/calcs-${loc}` : 'src/content/calcs';
    // Búsqueda rápida via grep
    try {
      const out = execSync(
        `grep -l '"formulaId": "${formulaId}"' ${dir}/*.json 2>/dev/null || true`,
        { encoding: 'utf8' },
      );
      for (const file of out.split('\n').filter(Boolean)) {
        const slug = readSlugFromJson(file);
        if (slug) slugs.add(slug);
      }
    } catch {
      // sin matches, skip
    }
  }
  return Array.from(slugs);
}

interface DetectResult {
  mode: 'full' | 'incremental';
  slugs: string[];
  locales: string[];
  reason: string;
  filesAnalyzed: number;
}

function writeOutput(lines: string[]): void {
  const out = lines.join('\n') + '\n';
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, out);
  }
  process.stdout.write(out);
}

function detect(baseSha: string): DetectResult {
  let entries: { status: string; path: string }[];
  try {
    const out = execSync(`git diff --name-status ${baseSha}...HEAD`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    entries = out
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('\t');
        return { status: parts[0], path: parts[parts.length - 1] };
      });
  } catch (err: any) {
    return {
      mode: 'full',
      slugs: [],
      locales: [],
      reason: `no se pudo diff vs ${baseSha}: ${err.message || err}`,
      filesAnalyzed: 0,
    };
  }

  // Delete (D) o rename (R) → archivos que ya no deberían estar en dist. Como
  // emptyOutDir=false no los borra, dejaríamos ghosts. Mejor full rebuild
  // (que limpia dist al inicio).
  const deletedOrRenamed = entries.find(
    (e) => e.status.startsWith('D') || e.status.startsWith('R'),
  );
  if (deletedOrRenamed) {
    return {
      mode: 'full',
      slugs: [],
      locales: [],
      reason: `delete/rename detectado: ${deletedOrRenamed.status} ${deletedOrRenamed.path}`,
      filesAnalyzed: entries.length,
    };
  }

  const files = entries.map((e) => e.path);

  if (files.length === 0) {
    // Sin diffs → puede ser primer deploy o re-run. Full por seguridad pero
    // probablemente termine en 2s porque no hay nada que regenerar.
    return {
      mode: 'full',
      slugs: [],
      locales: [],
      reason: 'sin cambios detectados',
      filesAnalyzed: 0,
    };
  }

  const slugs = new Set<string>();
  const locales = new Set<string>();

  for (const file of files) {
    // ignore primero (no participa de la decisión)
    if (IGNORE_PATTERNS.some((p) => p.test(file))) continue;

    // calc JSON específico — el slug real está adentro del JSON (filename
    // puede ser slug o formulaId). Locale 'ar' es el root, los demás son el
    // sufijo del directorio (calcs-en → 'en', etc.).
    const calcMatch = file.match(CALC_JSON_RE);
    if (calcMatch) {
      const locale = calcMatch[2] || 'ar';
      const slug = readSlugFromJson(file);
      if (!slug) {
        return {
          mode: 'full',
          slugs: [],
          locales: [],
          reason: `no se pudo leer slug de ${file}`,
          filesAnalyzed: files.length,
        };
      }
      slugs.add(slug);
      locales.add(locale);
      continue;
    }

    // formula TS específica — un mismo formulaId puede usarse en varios calcs
    // y locales. Buscamos qué slugs lo usan via grep en content/calcs*.
    const formMatch = file.match(FORMULA_TS_RE);
    if (formMatch) {
      const matchedSlugs = readSlugFromFormulaId(formMatch[1]);
      if (matchedSlugs.length === 0) {
        // Formula huérfana o nueva sin calc → defensivo: full
        return {
          mode: 'full',
          slugs: [],
          locales: [],
          reason: `formula ${formMatch[1]}.ts sin calcs asociados`,
          filesAnalyzed: files.length,
        };
      }
      for (const s of matchedSlugs) slugs.add(s);
      // Como no sabemos en qué locales aparece, marcamos todos
      ['ar', 'en', 'es', 'mx', 'cl', 'co', 'pt'].forEach((l) => locales.add(l));
      continue;
    }

    // shared
    for (const pat of SHARED_PATTERNS) {
      if (pat.test(file)) {
        return {
          mode: 'full',
          slugs: [],
          locales: [],
          reason: `shared file changed: ${file}`,
          filesAnalyzed: files.length,
        };
      }
    }

    // Archivo no clasificado → defensivo, full rebuild
    return {
      mode: 'full',
      slugs: [],
      locales: [],
      reason: `unclassified file (defensive full): ${file}`,
      filesAnalyzed: files.length,
    };
  }

  if (slugs.size === 0) {
    return {
      mode: 'full',
      slugs: [],
      locales: [],
      reason: 'solo cambios en archivos ignore (no debería disparar deploy)',
      filesAnalyzed: files.length,
    };
  }

  return {
    mode: 'incremental',
    slugs: Array.from(slugs).sort(),
    locales: Array.from(locales).sort(),
    reason: `${slugs.size} slug(s) en ${locales.size} locale(s)`,
    filesAnalyzed: files.length,
  };
}

function main(): void {
  if (!LAST_SHA) {
    console.log('[detect-changes] LAST_DEPLOY_SHA vacío → full build (probable primer deploy)');
    writeOutput([
      'mode=full',
      'slugs=',
      'locales=',
      'reason=no last deploy sha',
    ]);
    return;
  }

  console.log(`[detect-changes] diffeando ${LAST_SHA}...HEAD`);
  const result = detect(LAST_SHA);

  console.log(`[detect-changes] mode=${result.mode} files=${result.filesAnalyzed} reason="${result.reason}"`);
  if (result.mode === 'incremental') {
    console.log(`[detect-changes] slugs=${result.slugs.join(',')}`);
    console.log(`[detect-changes] locales=${result.locales.join(',')}`);
  }

  writeOutput([
    `mode=${result.mode}`,
    `slugs=${result.slugs.join(',')}`,
    `locales=${result.locales.join(',')}`,
    `reason=${result.reason}`,
  ]);
}

main();
