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
 *   "calcs":         { "slugs": ["X","Y"], "locales": ["ar","en"] },
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
 * Locales válidos: 'ar' (root), 'en', 'es', 'mx', 'cl', 'co', 'pt'.
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
  locales?: string[];
}

interface Changes {
  calcs?: ContentChanges;
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
 * Para 'calcs', también filtra por `locale` si la lista de locales
 * cambiados no incluye el que se pasa.
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

  const bucket = CHANGES[contentType];
  if (!bucket || bucket === true) {
    // contentType no tocado → no se regenera nada de este tipo
    // (excepción: iibb es boolean — se maneja con `shouldBuildContent`)
    return [];
  }

  const cc = bucket as ContentChanges;
  // Para calcs, filtrar por locale también
  if (contentType === 'calcs' && cc.locales && cc.locales.length > 0) {
    if (!cc.locales.includes(locale)) return [];
  }

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
