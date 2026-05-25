/**
 * Helper para builds incrementales.
 *
 * Cómo funciona:
 *   - En full build (default): no hay env vars → filterByIncremental devuelve
 *     todos los items sin modificar.
 *   - En incremental build: el workflow detecta qué cambió desde el último
 *     deploy exitoso y setea INCREMENTAL_SLUGS + INCREMENTAL_LOCALES. Cada
 *     getStaticPaths usa este helper para filtrar qué páginas regenerar.
 *
 * Convenciones:
 *   - INCREMENTAL_SLUGS: lista CSV de slugs cambiados (sin locale prefix).
 *   - INCREMENTAL_LOCALES: lista CSV de locales afectadas ('' para AR root,
 *     'en', 'es', 'mx', 'cl', 'co', 'pt'). Si una locale no está en la lista,
 *     getStaticPaths de ese locale devuelve [] (Astro skip-ea esas rutas).
 *
 * El resto de los HTMLs queda intacto del build anterior (dist/client/ se
 * restaura desde el cache de GH Actions antes de buildar).
 */

// Vite inline-ea estos placeholders via `define` en astro.config.mjs. Eso
// hace que las env vars del proceso padre estén disponibles en el bundle del
// adapter CF — `process.env` adentro del worker miniflare está vacío.
declare const __INCREMENTAL_SLUGS__: string;
declare const __INCREMENTAL_LOCALES__: string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SLUGS_ENV = (typeof __INCREMENTAL_SLUGS__ !== 'undefined' ? __INCREMENTAL_SLUGS__ : process.env.INCREMENTAL_SLUGS) ?? '';
const LOCALES_ENV = (typeof __INCREMENTAL_LOCALES__ !== 'undefined' ? __INCREMENTAL_LOCALES__ : process.env.INCREMENTAL_LOCALES) ?? '';

const INCREMENTAL_SLUGS: Set<string> | null = SLUGS_ENV
  ? new Set(SLUGS_ENV.split(',').map((s) => s.trim()).filter(Boolean))
  : null;

const INCREMENTAL_LOCALES: Set<string> | null = LOCALES_ENV
  ? new Set(LOCALES_ENV.split(',').map((s) => s.trim()))
  : null;

export const isIncrementalBuild = INCREMENTAL_SLUGS !== null;

if (isIncrementalBuild) {
  // eslint-disable-next-line no-console
  console.log(
    `[incremental] mode=ON slugs=${INCREMENTAL_SLUGS!.size} locales=${
      INCREMENTAL_LOCALES ? Array.from(INCREMENTAL_LOCALES).join('|') : 'all'
    }`,
  );
}

/**
 * Filtra un array de items (que tienen .slug) según los slugs cambiados.
 * En full build (sin env vars), devuelve el array intacto.
 *
 * @param items array de calcs/items con .slug
 * @param locale 'ar' para AR root, 'en'/'es'/'mx'/'cl'/'co'/'pt' para otros
 */
export function filterByIncremental<T extends { slug: string }>(
  items: T[],
  locale: string = 'ar',
): T[] {
  if (INCREMENTAL_SLUGS === null) return items;
  if (INCREMENTAL_LOCALES !== null && !INCREMENTAL_LOCALES.has(locale)) {
    return [];
  }
  return items.filter((item) => INCREMENTAL_SLUGS!.has(item.slug));
}
