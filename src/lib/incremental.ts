/**
 * Helper para builds incrementales (v2).
 *
 * Diseño:
 *   - `detect-changes.ts` analiza el diff y emite UN solo env var
 *     `INCREMENTAL_CHANGES` con JSON describiendo qué cambió por content type.
 *   - `astro.config.mjs` inline-ea esa env como `__INCREMENTAL_CHANGES__`
 *     porque `process.env` está vacío adentro del worker miniflare que
 *     usa el adapter CF para prerendear.
 *   - Cada `getStaticPaths` llama `filterByIncremental(items, ...)` con
 *     contentType + locale. En full build no filtra; en incremental devuelve
 *     solo los items relevantes.
 *
 * Estructura del JSON:
 * {
 *   "calcs":         { "slugs": ["X","Y"] },        // solo AR root
 *   "calcs_en":      { "slugs": ["foo"] },          // un bucket por locale
 *   "calcs_pt":      { "slugs": ["bar"] },
 *   "calcs_mx":      { "slugs": [...] },
 *   "calcs_cl":      { "slugs": [...] },
 *   "calcs_co":      { "slugs": [...] },
 *   "calcs_es":      { "slugs": [...] },
 *   "calcs_ec":      { "slugs": [...] },          // ...un bucket por vertical
 *   "calcs_pe":      { "slugs": [...] },
 *   "calcs_do":      { "slugs": [...] },
 *   "calcs_py":      { "slugs": [...] },
 *   "calcs_uy":      { "slugs": [...] },
 *   "calcs_ve":      { "slugs": [...] },
 *   "calcs_pt-pt":   { "slugs": [...] },          // locale compuesto
 *   "blog":          { "slugs": ["a-post"] },
 *   "guias":         { "slugs": ["la-guia"] },
 *   "tablas":        { "slugs": ["la-tabla"] },
 *   "comparaciones": { "slugs": ["X-vs-Y"] },
 *   "glosario":      { "slugs": ["termino"] },
 *   "argentina":     { "slugs": ["calc-prov-x"] },  // calcs en content/argentina/
 *   "iibb":          true,                            // si algo de iibb/ cambió
 *   "categories":    ["finanzas","salud"],           // derivado de calcs cambiados
 *   "provincias":    ["caba","buenos-aires"]         // derivado si aplica
 * }
 *
 * Locales válidos: 'ar' (root), 'en', 'es', 'mx', 'cl', 'co', 'pt', 'ec',
 * 'pe', 'do', 'py', 'uy', 've', 'pt-pt'.
 * Para calcs, filterByIncremental con locale='ar' lee `calcs`; con cualquier
 * otro locale lee `calcs_<locale>`. Cada bucket es independiente y solo
 * contiene los slugs de su locale → cero falsos positivos cross-locale.
 */

// Vite inline-ea este placeholder via `define` en astro.config.mjs.
declare const __INCREMENTAL_CHANGES__: string;

export type ContentType =
  | 'calcs'
  | 'blog'
  | 'guias'
  | 'tablas'
  | 'comparaciones'
  | 'glosario'
  | 'argentina'
  | 'iibb';

interface ContentChanges {
  slugs: string[];
}

interface Changes {
  calcs?: ContentChanges;
  calcs_en?: ContentChanges;
  calcs_pt?: ContentChanges;
  calcs_mx?: ContentChanges;
  calcs_cl?: ContentChanges;
  calcs_co?: ContentChanges;
  calcs_es?: ContentChanges;
  calcs_ec?: ContentChanges;
  calcs_pe?: ContentChanges;
  calcs_do?: ContentChanges;
  calcs_py?: ContentChanges;
  calcs_uy?: ContentChanges;
  calcs_ve?: ContentChanges;
  'calcs_pt-pt'?: ContentChanges;
  blog?: ContentChanges;
  guias?: ContentChanges;
  tablas?: ContentChanges;
  comparaciones?: ContentChanges;
  glosario?: ContentChanges;
  argentina?: ContentChanges;
  iibb?: boolean;
  categories?: string[];
  provincias?: string[];
}

const RAW = (typeof __INCREMENTAL_CHANGES__ !== 'undefined'
  ? __INCREMENTAL_CHANGES__
  : process.env.INCREMENTAL_CHANGES) ?? '';

let CHANGES: Changes | null = null;
if (RAW) {
  try {
    CHANGES = JSON.parse(RAW) as Changes;
  } catch {
    // RAW corrupto → full build defensivo
    CHANGES = null;
  }
}

export const isIncrementalBuild = CHANGES !== null;

if (isIncrementalBuild) {
  // eslint-disable-next-line no-console
  console.log('[incremental] v2 ON', JSON.stringify(CHANGES));
}

/**
 * Filtra items con `.slug` según los cambios detectados.
 *   - En full build: devuelve todos.
 *   - En incremental: devuelve solo los que matcheen el contentType.
 *
 * Para 'calcs', lee el bucket por locale: locale='ar' → `changes.calcs`,
 * locale='en' → `changes.calcs_en`, etc. Cada bucket solo contiene los
 * slugs de ese locale → un slug AR cambiado nunca regenera EN ni viceversa.
 *
 * @param items array con .slug
 * @param contentType  uno de los content types soportados
 * @param locale       'ar' para AR root, otras para locales no-AR (solo aplica a calcs)
 */
export function filterByIncremental<T extends { slug: string }>(
  items: T[],
  contentType: ContentType,
  locale: string = 'ar',
): T[] {
  if (CHANGES === null) return items;

  // Para calcs no-AR, leer el bucket por locale (`calcs_en`, `calcs_pt`, etc.)
  const bucketKey: keyof Changes = contentType === 'calcs' && locale !== 'ar'
    ? (`calcs_${locale}` as keyof Changes)
    : (contentType as keyof Changes);
  const bucket = CHANGES[bucketKey];
  if (!bucket || bucket === true) {
    // contentType no tocado → no se regenera nada de este tipo
    // (excepción: iibb es boolean — se maneja con `shouldBuildContent`)
    return [];
  }

  const cc = bucket as ContentChanges;
  const set = new Set(cc.slugs);
  return items.filter((item) => set.has(item.slug));
}

/**
 * Para rutas que no usan slug-list directo (categorías, iibb index, etc.).
 * Devuelve true si esta ruta/categoría/provincia tiene que regenerarse.
 */
export function shouldBuildCategory(category: string): boolean {
  if (CHANGES === null) return true;
  return Boolean(CHANGES.categories?.includes(category));
}

export function shouldBuildProvincia(provincia: string): boolean {
  if (CHANGES === null) return true;
  return Boolean(CHANGES.provincias?.includes(provincia));
}

export function shouldBuildIibb(): boolean {
  if (CHANGES === null) return true;
  return Boolean(CHANGES.iibb);
}
