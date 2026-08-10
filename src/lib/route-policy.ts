/**
 * Política de superficie para rutas heredadas que no pertenecen al catálogo
 * editorial actual.
 *
 * Estas páginas siguen existiendo para no romper enlaces históricos, pero no
 * deben competir en el índice junto con los hubs canónicos: nacieron como
 * calculadoras sueltas, no tienen el contrato editorial de un hub y algunas
 * tocan temas sensibles. La lista es deliberadamente explícita y reversible.
 */
const LEGACY_REVIEW_NOINDEX = new Set([
  '/calculadora-acidez-orina-alimentos',
  '/calculadora-alimento-diario-perro',
  '/calculadora-calorias-diarias-tdee',
]);

function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/, 1)[0].replace(/\.html$/, '').replace(/\/$/, '');
  return clean || '/';
}

export function isLegacyReviewNoindexPath(pathname: string): boolean {
  return LEGACY_REVIEW_NOINDEX.has(normalizePath(pathname));
}

export const LEGACY_REVIEW_NOINDEX_PATHS = [...LEGACY_REVIEW_NOINDEX];
