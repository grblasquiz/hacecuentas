/**
 * Fuente única de color por categoría.
 *
 * Estos valores espejan los de `categoryMeta` en src/pages/index.astro (que
 * además tiene label/desc/icon). Si cambiás un color, cambialo en ambos lados
 * (o, mejor, refactorizá index.astro para importar de acá).
 *
 * Uso: el color de marca global es azul (--accent). En las páginas de cada
 * calculadora seteamos `--cat` = color de su categoría para teñir la zona de
 * identidad (eyebrow + ícono + TOC activo), manteniendo el azul de marca para
 * el CTA y el resultado (consistencia + contraste garantizado).
 */
export const BRAND_DEFAULT = '#2563eb';

export const CATEGORY_COLORS: Record<string, string> = {
  finanzas: '#2563eb',
  salud: '#16a34a',
  negocios: '#7c3aed',
  marketing: '#e11d48',
  vida: '#d97706',
  deportes: '#65a30d',
  viajes: '#0891b2',
  construccion: '#b45309',
  cocina: '#ea580c',
  mascotas: '#db2777',
  matematica: '#0d9488',
  educacion: '#8b5cf6',
  automotor: '#6366f1',
  tecnologia: '#06b6d4',
  'medio-ambiente': '#22c55e',
  electronica: '#f59e0b',
  entretenimiento: '#ec4899',
  ciencia: '#6366f1',
  jardineria: '#15803d',
  familia: '#f43f5e',
  idiomas: '#14b8a6',
  impuestos: '#0ea5e9',
  hogar: '#a855f7',
  clima: '#38bdf8',
  juegos: '#f97316',
  astronomia: '#4f46e5',
};

/**
 * Variante OSCURA de cada color de categoría, pensada para usarse como color de
 * TEXTO (eyebrow, ranking) sobre fondo claro. Los CATEGORY_COLORS originales son
 * tintes -500/-600 que fallan WCAG AA (4.5:1) como texto a 11px; estos son los
 * -700/-800 de la misma paleta Tailwind y pasan AA. CATEGORY_COLORS queda para
 * fondos, tintes e íconos decorativos.
 */
export const CATEGORY_TEXT_COLORS: Record<string, string> = {
  finanzas: '#1d4ed8',
  salud: '#15803d',
  negocios: '#6d28d9',
  marketing: '#be123c',
  vida: '#b45309',
  deportes: '#4d7c0f',
  viajes: '#0e7490',
  construccion: '#92400e',
  cocina: '#c2410c',
  mascotas: '#be185d',
  matematica: '#0f766e',
  educacion: '#6d28d9',
  automotor: '#4338ca',
  tecnologia: '#0e7490',
  'medio-ambiente': '#15803d',
  electronica: '#b45309',
  entretenimiento: '#be185d',
  ciencia: '#4338ca',
  jardineria: '#166534',
  familia: '#be123c',
  idiomas: '#0f766e',
  impuestos: '#0369a1',
  hogar: '#7e22ce',
  clima: '#0369a1',
  juegos: '#c2410c',
  astronomia: '#4338ca',
};

/** Color de la categoría (tinte -500/-600), con fallback al azul de marca. */
export function categoryColor(cat: string | undefined | null): string {
  if (!cat) return BRAND_DEFAULT;
  return CATEGORY_COLORS[cat] || BRAND_DEFAULT;
}

/** Variante de texto (AA-safe) de la categoría, con fallback al azul de marca. */
export function categoryTextColor(cat: string | undefined | null): string {
  if (!cat) return BRAND_DEFAULT;
  return CATEGORY_TEXT_COLORS[cat] || BRAND_DEFAULT;
}
