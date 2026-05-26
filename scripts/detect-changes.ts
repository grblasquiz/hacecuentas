/**
 * Detect changes since last successful deploy (v2 — multi content type).
 *
 * Lee LAST_DEPLOY_SHA y compara contra HEAD. Clasifica los archivos en
 * múltiples content types y emite un único JSON con todo lo que cambió:
 *
 *   {
 *     "calcs":         { "slugs": [...] },   // solo AR root
 *     "calcs_en":      { "slugs": [...] },
 *     "calcs_pt":      { "slugs": [...] },
 *     "calcs_mx":      { "slugs": [...] },
 *     "calcs_cl":      { "slugs": [...] },
 *     "calcs_co":      { "slugs": [...] },
 *     "calcs_es":      { "slugs": [...] },
 *     "blog":          { "slugs": [...] },
 *     "guias":         { "slugs": [...] },
 *     "tablas":        { "slugs": [...] },
 *     "comparaciones": { "slugs": [...] },
 *     "glosario":      { "slugs": [...] },
 *     "argentina":     { "slugs": [...] },
 *     "iibb":          true | false,
 *     "categories":    [...],   // derivado leyendo c.category de calcs cambiados
 *     "provincias":    [...]    // derivado de calcs en content/argentina/
 *   }
 *
 * Cada locale tiene su propio bucket de slugs porque un mismo slug podría
 * existir en varios locales (caso raro hoy, frágil ante futuros renombres).
 * Bucketizar por locale evita falsos positivos en el filter incremental.
 *
 * Outputs:
 *   - $GITHUB_OUTPUT: `mode=full|incremental`, `changes_json=...` (compact)
 *   - stdout (para uso local sin GH)
 *
 * Fallbacks defensivos:
 *   - LAST_DEPLOY_SHA vacío → full
 *   - git diff fail → full
 *   - Delete/rename → full (emptyOutDir:false dejaría ghosts en dist)
 *   - Archivo no clasificado → full
 */

import { execSync } from 'node:child_process';
import { appendFileSync, readFileSync, existsSync } from 'node:fs';

const LAST_SHA = process.env.LAST_DEPLOY_SHA || '';

// Patrones que disparan FULL rebuild si cambian. Defensivo: ante la duda, full.
const SHARED_PATTERNS: RegExp[] = [
  /^src\/components\//,
  /^src\/layouts\//,
  /^src\/lib\/(?!formulas\/[^/]+\.ts$)/,
  /^src\/styles\//,
  /^src\/pages\//,
  /^src\/middleware/,
  /^src\/env\.d\.ts$/,
  /^astro\.config\./,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^wrangler\./,
  /^scripts\/(?!new-calc\.ts$|cf-purge-cache\.sh$|detect-changes\.ts$|incremental-purge\.ts$)/,
  /^public\//,
  /^tsconfig\.json$/,
  /^\.github\/workflows\/deploy\.yml$/,
  // Archivos de content que afectan TODA una ruta cuando cambian
  /^src\/content\/argentina\/provincias\.json$/,
  /^src\/content\/iibb\/actividades\.json$/,
];

// Patrones que se pueden ignorar (no afectan build de prod).
const IGNORE_PATTERNS: RegExp[] = [
  /^docs\//,
  /^cerebro\//,
  /^audits\//,
  /^reports\//,
  /\.md$/,
  /^\.githooks\//,
  /^\.vscode\//,
  /^\.github\/workflows\/(?!deploy\.yml).+\.yml$/,
  /^\.github\/(?!workflows\/).+/,
  /^public\/og\//,
  /^public\/search-index\.json$/,
  /^public\/sw\.js$/,
  /^src\/lib\/og-manifest\.json$/,
  /^src\/lib\/related-auto\.(json|hash)$/,
  // Auto-regenerado por scripts/regenerate-formula-index.ts en cada prebuild.
  // Solo agrega entries para slugs nuevos — no afecta lógica de calcs viejas,
  // solo permite que las nuevas resuelvan su formula. Tratamos como artifact.
  /^src\/lib\/formulas\/index\.ts$/,
  /^\.gitignore$/,
  // Scripts de tooling local que no afectan el build de prod.
  /^scripts\/detect-changes\.ts$/,
  /^scripts\/incremental-purge\.ts$/,
  /^scripts\/deploy-local\.sh$/,
  /^scripts\/new-calc\.ts$/,
  /^scripts\/cf-purge-cache\.sh$/,
  // Scripts de submission a buscadores (post-deploy o cron, no afectan build)
  /^scripts\/bing-/,
  /^scripts\/google-indexing-/,
  /^scripts\/indexnow-/,
  /^scripts\/submit-indexnow/,
  /^scripts\/post-deploy-/,
];

// Regex de content types
const CALC_RE = /^src\/content\/calcs(-([a-z]{2}))?\/([^/]+)\.json$/;
const FORMULA_TS_RE = /^src\/lib\/formulas\/([^/]+)\.ts$/;
const LOCALES = ['ar', 'en', 'es', 'mx', 'cl', 'co', 'pt'] as const;
type Locale = typeof LOCALES[number];
const BLOG_RE = /^src\/content\/blog\/([^/]+)\.json$/;
const GUIAS_RE = /^src\/content\/guias\/([^/]+)\.json$/;
const TABLAS_RE = /^src\/content\/tablas\/([^/]+)\.json$/;
const COMPARACIONES_RE = /^src\/content\/comparaciones\/([^/]+)\.json$/;
const GLOSARIO_RE = /^src\/content\/glosario\/([^/]+)\.json$/;
const ARGENTINA_RE = /^src\/content\/argentina\/([^/]+)\.json$/;
const IIBB_RE = /^src\/content\/iibb\//;

interface ContentChanges {
  slugs: Set<string>;
}

interface DetectResult {
  mode: 'full' | 'incremental' | 'skip';
  changes?: {
    calcs?: { slugs: string[] };
    calcs_en?: { slugs: string[] };
    calcs_pt?: { slugs: string[] };
    calcs_mx?: { slugs: string[] };
    calcs_cl?: { slugs: string[] };
    calcs_co?: { slugs: string[] };
    calcs_es?: { slugs: string[] };
    blog?: { slugs: string[] };
    guias?: { slugs: string[] };
    tablas?: { slugs: string[] };
    comparaciones?: { slugs: string[] };
    glosario?: { slugs: string[] };
    argentina?: { slugs: string[] };
    iibb?: boolean;
    categories?: string[];
    provincias?: string[];
  };
  reason: string;
  filesAnalyzed: number;
}

function readSlugFromJson(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data.slug || null;
  } catch {
    return null;
  }
}

function readJsonField<T = unknown>(filePath: string, field: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data[field] ?? null;
  } catch {
    return null;
  }
}

function readSlugsFromFormulaId(formulaId: string): { slug: string; locale: string }[] {
  const locales = ['ar', 'en', 'es', 'mx', 'cl', 'co', 'pt'];
  const out: { slug: string; locale: string }[] = [];
  for (const loc of locales) {
    const dir = loc === 'ar' ? 'src/content/calcs' : `src/content/calcs-${loc}`;
    try {
      const grepOut = execSync(
        `grep -l '"formulaId": "${formulaId}"' ${dir}/*.json 2>/dev/null || true`,
        { encoding: 'utf8' },
      );
      for (const file of grepOut.split('\n').filter(Boolean)) {
        const slug = readSlugFromJson(file);
        if (slug) out.push({ slug, locale: loc });
      }
    } catch {
      // sin matches
    }
  }
  return out;
}

function fullResult(reason: string, filesAnalyzed: number = 0): DetectResult {
  return { mode: 'full', reason, filesAnalyzed };
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
    return fullResult(`no se pudo diff vs ${baseSha}: ${err.message || err}`);
  }

  if (entries.length === 0) {
    return fullResult('sin cambios detectados');
  }

  // Delete/rename → full (emptyOutDir:false dejaría ghosts)
  const dr = entries.find(
    (e) => e.status.startsWith('D') || e.status.startsWith('R'),
  );
  if (dr) {
    return fullResult(`delete/rename: ${dr.status} ${dr.path}`, entries.length);
  }

  const files = entries.map((e) => e.path);

  const calcsByLocale: Record<Locale, Set<string>> = {
    ar: new Set(), en: new Set(), es: new Set(), mx: new Set(),
    cl: new Set(), co: new Set(), pt: new Set(),
  };
  const blog: ContentChanges = { slugs: new Set() };
  const guias: ContentChanges = { slugs: new Set() };
  const tablas: ContentChanges = { slugs: new Set() };
  const comparaciones: ContentChanges = { slugs: new Set() };
  const glosario: ContentChanges = { slugs: new Set() };
  const argentina: ContentChanges = { slugs: new Set() };
  const provincias = new Set<string>();
  const categories = new Set<string>();
  let iibb = false;

  for (const file of files) {
    if (IGNORE_PATTERNS.some((p) => p.test(file))) continue;

    // Calcs JSON
    const calcM = file.match(CALC_RE);
    if (calcM) {
      const locale = (calcM[2] || 'ar') as Locale;
      const slug = readSlugFromJson(file);
      if (!slug) return fullResult(`no se pudo leer slug de ${file}`, files.length);
      calcsByLocale[locale].add(slug);
      // Derivar categoría
      const cat = readJsonField<string>(file, 'category');
      if (cat) categories.add(cat);
      continue;
    }

    // Formula TS — afecta múltiples slugs/locales
    const formM = file.match(FORMULA_TS_RE);
    if (formM) {
      const matched = readSlugsFromFormulaId(formM[1]);
      if (matched.length === 0) {
        return fullResult(`formula ${formM[1]}.ts sin calcs asociados`, files.length);
      }
      for (const m of matched) {
        calcsByLocale[m.locale as Locale].add(m.slug);
        // Categoría del calc
        const dir = m.locale === 'ar' ? 'src/content/calcs' : `src/content/calcs-${m.locale}`;
        // El filename puede ser slug o formulaId; intentamos ambos
        for (const fname of [`${m.slug}.json`, `${formM[1]}.json`]) {
          const cat = readJsonField<string>(`${dir}/${fname}`, 'category');
          if (cat) { categories.add(cat); break; }
        }
      }
      continue;
    }

    if (BLOG_RE.test(file)) {
      const slug = readSlugFromJson(file);
      if (!slug) return fullResult(`no slug en ${file}`, files.length);
      blog.slugs.add(slug);
      continue;
    }
    if (GUIAS_RE.test(file)) {
      const slug = readSlugFromJson(file);
      if (!slug) return fullResult(`no slug en ${file}`, files.length);
      guias.slugs.add(slug);
      continue;
    }
    if (TABLAS_RE.test(file)) {
      const slug = readSlugFromJson(file);
      if (!slug) return fullResult(`no slug en ${file}`, files.length);
      tablas.slugs.add(slug);
      continue;
    }
    if (COMPARACIONES_RE.test(file)) {
      const slug = readSlugFromJson(file);
      if (!slug) return fullResult(`no slug en ${file}`, files.length);
      comparaciones.slugs.add(slug);
      continue;
    }
    if (GLOSARIO_RE.test(file)) {
      const slug = readSlugFromJson(file);
      if (!slug) return fullResult(`no slug en ${file}`, files.length);
      glosario.slugs.add(slug);
      continue;
    }

    // Argentina (calcs provinciales) — excluyendo provincias.json (en SHARED)
    // Estos JSON usan `calcSlug` en vez de `slug`.
    const argM = file.match(ARGENTINA_RE);
    if (argM && argM[1] !== 'provincias' && !argM[1].includes('ingresos-brutos')) {
      const calcSlug = readJsonField<string>(file, 'calcSlug');
      if (!calcSlug) return fullResult(`no calcSlug en ${file}`, files.length);
      argentina.slugs.add(calcSlug);
      // provinceData es un dict {provSlug: ...}. Si cambian todos los provinceData,
      // todas las combinaciones (provincia × calc) podrían cambiar; nosotros marcamos
      // todas las provincias del JSON como afectadas.
      const provData = readJsonField<Record<string, unknown>>(file, 'provinceData');
      if (provData && typeof provData === 'object') {
        for (const provSlug of Object.keys(provData)) provincias.add(provSlug);
      }
      continue;
    }
    // ingresos-brutos.json en argentina = shared (afecta iibb específicos)
    if (file === 'src/content/argentina/ingresos-brutos.json') {
      return fullResult(`argentina/ingresos-brutos.json (shared)`, files.length);
    }

    if (IIBB_RE.test(file)) {
      iibb = true;
      continue;
    }

    // Shared
    if (SHARED_PATTERNS.some((p) => p.test(file))) {
      return fullResult(`shared: ${file}`, files.length);
    }

    return fullResult(`no clasificado (defensive full): ${file}`, files.length);
  }

  // ¿Hubo algún cambio de content?
  const anyCalcChange = LOCALES.some((loc) => calcsByLocale[loc].size > 0);
  const anyChange =
    anyCalcChange ||
    blog.slugs.size > 0 ||
    guias.slugs.size > 0 ||
    tablas.slugs.size > 0 ||
    comparaciones.slugs.size > 0 ||
    glosario.slugs.size > 0 ||
    argentina.slugs.size > 0 ||
    iibb;

  if (!anyChange) {
    // Solo cambios en archivos ignore (tooling, docs, etc.). No hay nada
    // que regenerar en dist. Devolvemos un modo especial "skip" para que
    // el deploy script salga sin buildear ni subir nada.
    return {
      mode: 'skip' as const,
      reason: 'solo cambios en archivos ignore (tooling/docs)',
      filesAnalyzed: files.length,
    } as unknown as DetectResult;
  }

  const changes: DetectResult['changes'] = {};
  if (calcsByLocale.ar.size > 0) {
    changes.calcs = { slugs: Array.from(calcsByLocale.ar).sort() };
  }
  for (const loc of LOCALES) {
    if (loc === 'ar') continue;
    if (calcsByLocale[loc].size > 0) {
      const key = `calcs_${loc}` as keyof NonNullable<DetectResult['changes']>;
      (changes as Record<string, unknown>)[key] = {
        slugs: Array.from(calcsByLocale[loc]).sort(),
      };
    }
  }
  if (blog.slugs.size > 0) changes.blog = { slugs: Array.from(blog.slugs).sort() };
  if (guias.slugs.size > 0) changes.guias = { slugs: Array.from(guias.slugs).sort() };
  if (tablas.slugs.size > 0) changes.tablas = { slugs: Array.from(tablas.slugs).sort() };
  if (comparaciones.slugs.size > 0) changes.comparaciones = { slugs: Array.from(comparaciones.slugs).sort() };
  if (glosario.slugs.size > 0) changes.glosario = { slugs: Array.from(glosario.slugs).sort() };
  if (argentina.slugs.size > 0) changes.argentina = { slugs: Array.from(argentina.slugs).sort() };
  if (iibb) changes.iibb = true;
  if (categories.size > 0) changes.categories = Array.from(categories).sort();
  if (provincias.size > 0) changes.provincias = Array.from(provincias).sort();

  return {
    mode: 'incremental',
    changes,
    reason: `${Object.keys(changes).length} content type(s) cambiados`,
    filesAnalyzed: files.length,
  };
}

function writeOutput(lines: string[]): void {
  const out = lines.join('\n') + '\n';
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, out);
  }
  process.stdout.write(out);
}

function main(): void {
  if (!LAST_SHA) {
    console.log('[detect-changes] LAST_DEPLOY_SHA vacío → full');
    writeOutput([
      'mode=full',
      'changes_json=',
      'reason=no last deploy sha',
    ]);
    return;
  }

  console.log(`[detect-changes] diffeando ${LAST_SHA}...HEAD`);
  const result = detect(LAST_SHA);

  console.log(`[detect-changes] mode=${result.mode} files=${result.filesAnalyzed} reason="${result.reason}"`);

  if (result.mode === 'incremental' && result.changes) {
    console.log('[detect-changes] changes:', JSON.stringify(result.changes, null, 2));
    writeOutput([
      'mode=incremental',
      `changes_json=${JSON.stringify(result.changes)}`,
      `reason=${result.reason}`,
    ]);
  } else if (result.mode === 'skip') {
    writeOutput([
      'mode=skip',
      'changes_json=',
      `reason=${result.reason}`,
    ]);
  } else {
    writeOutput([
      'mode=full',
      'changes_json=',
      `reason=${result.reason}`,
    ]);
  }
}

main();
