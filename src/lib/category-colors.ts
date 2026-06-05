/**
 * Fuente única de color por categoría.
 *
 * Estos valores espejan los de `categoryMeta` en src/pages/index.astro (que
 * además tiene label/desc/icon). Si cambiás un color, cambialo en ambos lados
 * (o, mejor, refactorizá index.astro para importar de acá).
 *
 * Uso: el color de marca global es teal (--accent). En las páginas de cada
 * calculadora seteamos `--cat` = color de su categoría para teñir la zona de
 * identidad (eyebrow + ícono + TOC activo), manteniendo el teal para el CTA
 * y el resultado (consistencia + contraste garantizado).
 */
export const BRAND_TEAL = '#0d9488';

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

/** Color de la categoría, con fallback al teal de marca. */
export function categoryColor(cat: string | undefined | null): string {
  if (!cat) return BRAND_TEAL;
  return CATEGORY_COLORS[cat] || BRAND_TEAL;
}
