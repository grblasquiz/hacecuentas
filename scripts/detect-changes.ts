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
 *     "calcs_ec": ... "calcs_pe" ... "calcs_do" ... "calcs_py" ...
 *     "calcs_uy" ... "calcs_ve" ... "calcs_pt-pt":  { "slugs": [...] },
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
 *   - Delete/rename → full, salvo assets públicos seguros
 *   - Archivo no clasificado → full
 */

import { execSync } from 'node:child_process';
import { appendFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';

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

// Archivos públicos que se pueden desplegar sin rebuild Astro. Se copian directo
// a dist/client y wrangler sube el delta de assets. Excluimos rutas que afectan
// wrapper, routing, sitemap o service worker.
const PUBLIC_ASSET_RE = /^public\/(.+)$/;
const UNSAFE_PUBLIC_ASSET_PATTERNS: RegExp[] = [
  /^public\/_redirects$/,
  /^public\/_headers$/,
  /^public\/_routes\.json$/,
  /^public\/sitemap.*\.xml$/,
  /^public\/rss\.xml$/,
  /^public\/feed\.json$/,
  /^public\/search-index\.json$/,
  /^public\/sw\.js$/,
  /^public\/robots\.txt$/,
  /^public\/manifest\.webmanifest$/,
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
  // ── Artefactos generados por el propio build/prebuild ──────────────────
  // TODOS se regeneran en CADA build (incremental incluido) y se commitean
  // post-deploy (auto-commit "artefactos build"). Si NO estuvieran acá, el
  // diff del deploy SIGUIENTE los vería y caería a `defensive full`/`shared`
  // SIEMPRE — el "artifact trap": cada deploy arrastra los artefactos del
  // anterior y nunca va incremental. Ninguno afecta el HTML de OTRAS páginas:
  // o son índices/estado que el prebuild reescribe y copia a dist, o assets
  // estáticos derivados del contenido. Su frescura la garantiza el prebuild,
  // no el diff. (Ver scripts/prebuild.ts para el mapeo script→archivo.)
  /^db\/sitemap-state\.json$/,               // generate-sitemap (estado interno)
  /^public\/sitemap[^/]*\.xml$/,             // generate-sitemap (todos los sitemaps)
  /^public\/api\//,                          // generate-calc-api-index (catálogo LLM)
  /^public\/llms(-full)?\.txt$/,             // sync-calc-counts / generate-llms-full
  /^public\/ai\.txt$/,                       // sync-calc-counts
  /^public\/openapi\.json$/,                 // sync-calc-counts
  /^public\/\.well-known\//,                 // sync-calc-counts (ai-plugin, openapi.yaml)
  /^public\/google-page-feed\.csv$/,         // generate-page-feed
  /^src\/lib\/calc-compute-index\.json$/,    // generate-compute-index
  /^src\/lib\/hreflang-index\.json$/,        // generate-hreflang-index
  /^src\/lib\/profile\/usage-auto\.json$/,   // generate-profile-usage
  // related-auto de TODOS los locales (-co, -mx, -py, -en, -cl, ...), no solo
  // el AR. compute-related los reescribe; su hash controla el skip incremental.
  /^src\/lib\/related-auto[^/]*\.(json|hash)$/,
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
// Locale = 2 letras, opcionalmente compuesto (`pt-pt`). El sufijo del dir
// (`calcs-<loc>`) coincide 1:1 con el key que pasa cada [...slug].astro y con
// el bucket `calcs_<loc>` que consume filterByIncremental.
const CALC_RE = /^src\/content\/calcs(-([a-z]{2}(?:-[a-z]{2})?))?\/([^/]+)\.json$/;
const FORMULA_TS_RE = /^src\/lib\/formulas\/([^/]+)\.ts$/;
const LOCALES = [
  'ar', 'en', 'es', 'mx', 'cl', 'co', 'pt',
  'ec', 'pe', 'do', 'py', 'uy', 've', 'pt-pt',
] as const;
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
  mode: 'assets' | 'full' | 'incremental' | 'skip';
  changes?: {
    assets?: { paths: string[] };
    calcs?: { slugs: string[] };
    calcs_en?: { slugs: string[] };
    calcs_pt?: { slugs: string[] };
    calcs_mx?: { slugs: string[] };
    calcs_cl?: { slugs: string[] };
    calcs_co?: { slugs: string[] };
    calcs_es?: { slugs: string[] };
    calcs_ec?: { slugs: string[] };
    calcs_pe?: { slugs: string[] };
    calcs_do?: { slugs: string[] };
    calcs_py?: { slugs: string[] };
    calcs_uy?: { slugs: string[] };
    calcs_ve?: { slugs: string[] };
    'calcs_pt-pt'?: { slugs: string[] };
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
  const locales = LOCALES;
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

// Fórmulas que importan `./<helperId>` (helper compartido tipo `_ocio-costos.ts`,
// que no tiene calc directo pero lo usan N fórmulas). Lee los .ts de formulas/
// una sola vez y devuelve los formulaId importadores.
function formulaImporters(helperId: string): string[] {
  let files: string[];
  try {
    files = readdirSync('src/lib/formulas').filter((f) => f.endsWith('.ts'));
  } catch {
    return [];
  }
  const needles = [`./${helperId}'`, `./${helperId}"`];
  const out: string[] = [];
  for (const f of files) {
    const id = f.slice(0, -3);
    if (id === helperId) continue;
    try {
      const src = readFileSync(`src/lib/formulas/${f}`, 'utf8');
      if (needles.some((n) => src.includes(n))) out.push(id);
    } catch {
      // archivo ilegible → skip
    }
  }
  return out;
}

// Resuelve un helper compartido a los slugs de las calcs afectadas, recursando
// hasta 2 niveles (helper de helper es raro). Si nada resuelve → [] → el caller
// cae a full defensivo. Nunca peor que el comportamiento anterior.
function resolveHelperFormulaSlugs(
  helperId: string,
  depth = 0,
  seen: Set<string> = new Set(),
): { slug: string; locale: string }[] {
  if (depth > 2 || seen.has(helperId)) return [];
  seen.add(helperId);
  const out: { slug: string; locale: string }[] = [];
  for (const impId of formulaImporters(helperId)) {
    let s = readSlugsFromFormulaId(impId);
    if (s.length === 0) s = resolveHelperFormulaSlugs(impId, depth + 1, seen);
    out.push(...s);
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
    return {
      mode: 'skip',
      reason: 'sin cambios detectados',
      filesAnalyzed: 0,
    };
  }

  const files = entries.map((e) => e.path);

  const hasRename = entries.some((e) => e.status.startsWith('R'));
  const publicAssetFiles = files.filter((file) => {
    if (!PUBLIC_ASSET_RE.test(file)) return false;
    return !UNSAFE_PUBLIC_ASSET_PATTERNS.some((p) => p.test(file));
  });
  const onlyPublicAssets = !hasRename && publicAssetFiles.length === files.length;

  if (onlyPublicAssets) {
    return {
      mode: 'assets',
      changes: { assets: { paths: Array.from(new Set(publicAssetFiles)).sort() } },
      reason: `${publicAssetFiles.length} asset(s) públicos`,
      filesAnalyzed: files.length,
    };
  }

  // Delete/rename → full (emptyOutDir:false dejaría ghosts)
  const dr = entries.find(
    (e) => e.status.startsWith('D') || e.status.startsWith('R'),
  );
  if (dr) {
    return fullResult(`delete/rename: ${dr.status} ${dr.path}`, entries.length);
  }

  const calcsByLocale: Record<Locale, Set<string>> = {
    ar: new Set(), en: new Set(), es: new Set(), mx: new Set(),
    cl: new Set(), co: new Set(), pt: new Set(),
    ec: new Set(), pe: new Set(), do: new Set(), py: new Set(),
    uy: new Set(), ve: new Set(), 'pt-pt': new Set(),
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
      const locStr = calcM[2] || 'ar';
      // Locale no soportado (dir `calcs-xx` nuevo sin cablear) → full defensivo
      // en vez de crashear indexando calcsByLocale[undefined].
      if (!(LOCALES as readonly string[]).includes(locStr)) {
        return fullResult(`locale no soportado (${locStr}) en ${file}`, files.length);
      }
      const locale = locStr as Locale;
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
      let matched = readSlugsFromFormulaId(formM[1]);
      // Helper compartido (ej: `_ocio-costos.ts`): sin calc directo, pero lo
      // importan otras fórmulas. Resolvemos los slugs de esas importadoras para
      // que el cambio propague incremental en vez de forzar full.
      if (matched.length === 0) {
        matched = resolveHelperFormulaSlugs(formM[1]);
        if (matched.length > 0) {
          console.log(`[detect-changes] ${formM[1]}.ts = helper → ${matched.length} calc(s) afectadas`);
        }
      }
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

  if (result.mode === 'assets' && result.changes) {
    console.log('[detect-changes] assets:', JSON.stringify(result.changes, null, 2));
    writeOutput([
      'mode=assets',
      `changes_json=${JSON.stringify(result.changes)}`,
      `reason=${result.reason}`,
    ]);
  } else if (result.mode === 'incremental' && result.changes) {
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
