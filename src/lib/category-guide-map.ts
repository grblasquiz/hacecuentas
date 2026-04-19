/**
 * Mapeo categoría → guía pilar para interlinking SEO.
 *
 * Cada calc tiene `category`. Usamos este mapa para vincular a la guía
 * pilar correspondiente desde: template de categoría, calc individual,
 * y al revés (guía → categoría).
 *
 * Guías que NO están en el map (sin relación 1-a-1 con categoría):
 * - impuestos-argentina-2026 (cross-category — impuestos específicos AR)
 * - subsidios-anses-2026 (cross-category — ANSES)
 * - sueldos-argentina-2026 (cross-category — trabajo/sueldos)
 *
 * Esas se usan con override manual en `guideSlug` del JSON si aplica.
 */

export const CATEGORY_TO_GUIDE: Record<string, string> = {
  finanzas: 'finanzas-personales',
  negocios: 'finanzas-personales',
  marketing: 'finanzas-personales',
  salud: 'salud-nutricion-fitness',
  deportes: 'salud-nutricion-fitness',
  familia: 'embarazo-y-bebe',
  educacion: 'productividad-aprendizaje',
  idiomas: 'productividad-aprendizaje',
  tecnologia: 'productividad-aprendizaje',
  matematica: 'matematicas-ciencias',
  ciencia: 'matematicas-ciencias',
  cocina: 'cocina-medidas-recetas',
  construccion: 'construccion-diy-hogar',
  jardineria: 'construccion-diy-hogar',
};

/** Títulos cortos para UI de links (evitar depender de carga JSON). */
export const GUIDE_TITLES: Record<string, string> = {
  'finanzas-personales': 'Finanzas personales',
  'salud-nutricion-fitness': 'Salud, nutrición y fitness',
  'embarazo-y-bebe': 'Embarazo y bebé',
  'productividad-aprendizaje': 'Productividad y aprendizaje',
  'matematicas-ciencias': 'Matemáticas y ciencias',
  'cocina-medidas-recetas': 'Cocina, medidas y recetas',
  'construccion-diy-hogar': 'Construcción, DIY y hogar',
  'impuestos-argentina-2026': 'Impuestos Argentina 2026',
  'subsidios-anses-2026': 'Subsidios ANSES 2026',
  'sueldos-argentina-2026': 'Sueldos Argentina 2026',
};

/** Categorías hermanas (temáticas cercanas) para sidebar de categoría. */
export const SIBLING_CATEGORIES: Record<string, string[]> = {
  finanzas: ['negocios', 'marketing'],
  negocios: ['finanzas', 'marketing'],
  marketing: ['negocios', 'finanzas'],
  salud: ['deportes', 'familia'],
  deportes: ['salud', 'familia'],
  familia: ['salud', 'cocina'],
  educacion: ['idiomas', 'matematica'],
  idiomas: ['educacion', 'productividad-aprendizaje' as any],
  tecnologia: ['ciencia', 'matematica'],
  matematica: ['ciencia', 'educacion'],
  ciencia: ['matematica', 'tecnologia'],
  cocina: ['familia', 'jardineria'],
  construccion: ['jardineria', 'automotor'],
  jardineria: ['construccion', 'cocina'],
  automotor: ['construccion', 'viajes'],
  viajes: ['vida', 'automotor'],
  vida: ['familia', 'viajes'],
  mascotas: ['familia', 'vida'],
  entretenimiento: ['vida', 'educacion'],
  electronica: ['tecnologia', 'ciencia'],
  'medio-ambiente': ['ciencia', 'jardineria'],
};

/** Reverse map: guía pilar → categorías relacionadas (para links guía→categoría). */
export const GUIDE_TO_CATEGORIES: Record<string, string[]> = {
  'finanzas-personales': ['finanzas', 'negocios', 'marketing'],
  'salud-nutricion-fitness': ['salud', 'deportes'],
  'embarazo-y-bebe': ['familia', 'salud'],
  'productividad-aprendizaje': ['educacion', 'idiomas', 'tecnologia'],
  'matematicas-ciencias': ['matematica', 'ciencia'],
  'cocina-medidas-recetas': ['cocina'],
  'construccion-diy-hogar': ['construccion', 'jardineria'],
  'impuestos-argentina-2026': ['finanzas'],
  'subsidios-anses-2026': ['finanzas', 'familia'],
  'sueldos-argentina-2026': ['finanzas'],
};

/** Iconos por categoría (fallback). */
export const CATEGORY_ICONS: Record<string, string> = {
  finanzas: '💰',
  negocios: '💼',
  marketing: '📣',
  salud: '🩺',
  deportes: '⚽',
  familia: '👨‍👩‍👧',
  educacion: '📚',
  idiomas: '🗣️',
  tecnologia: '💻',
  matematica: '➗',
  ciencia: '🔬',
  cocina: '🍳',
  construccion: '🔨',
  jardineria: '🌱',
  automotor: '🚗',
  viajes: '✈️',
  vida: '🏠',
  mascotas: '🐾',
  entretenimiento: '🎮',
  electronica: '⚡',
  'medio-ambiente': '🌍',
};

/** Títulos legibles de categorías para UI. */
export const CATEGORY_TITLES: Record<string, string> = {
  finanzas: 'Finanzas',
  negocios: 'Negocios',
  marketing: 'Marketing',
  salud: 'Salud',
  deportes: 'Deportes',
  familia: 'Familia',
  educacion: 'Educación',
  idiomas: 'Idiomas',
  tecnologia: 'Tecnología',
  matematica: 'Matemática',
  ciencia: 'Ciencia',
  cocina: 'Cocina',
  construccion: 'Construcción',
  jardineria: 'Jardinería',
  automotor: 'Automotor',
  viajes: 'Viajes',
  vida: 'Vida diaria',
  mascotas: 'Mascotas',
  entretenimiento: 'Entretenimiento',
  electronica: 'Electrónica',
  'medio-ambiente': 'Medio ambiente',
};
