/**
 * Mapeo categoría → guía pilar para interlinking SEO.
 *
 * Cada calc tiene `category`. Usamos este mapa para vincular a la guía
 * pilar correspondiente desde: template de categoría, calc individual,
 * y al revés (guía → categoría).
 *
 * Las guías AR cross-category (sueldos / impuestos / ANSES) NO se mapean por
 * categoría —agrupan calcs de varias categorías— sino por patrón de slug en
 * `resolveGuideSlug()` (ver abajo), que tiene prioridad sobre este mapa.
 *
 * Objetivo: que CADA calc tenga ruta a un hub (antes ~28% quedaban huérfanas).
 */

export const CATEGORY_TO_GUIDE: Record<string, string> = {
  finanzas: 'finanzas-personales',
  negocios: 'finanzas-personales',
  marketing: 'marketing-roi-metricas',
  salud: 'salud-nutricion-fitness',
  deportes: 'salud-nutricion-fitness',
  familia: 'embarazo-y-bebe',
  educacion: 'productividad-aprendizaje',
  idiomas: 'productividad-aprendizaje',
  tecnologia: 'productividad-aprendizaje',
  electronica: 'productividad-aprendizaje',
  matematica: 'matematicas-ciencias',
  ciencia: 'matematicas-ciencias',
  'medio-ambiente': 'matematicas-ciencias',
  clima: 'matematicas-ciencias',
  astronomia: 'matematicas-ciencias',
  cocina: 'cocina-medidas-recetas',
  construccion: 'construccion-diy-hogar',
  jardineria: 'construccion-diy-hogar',
  hogar: 'construccion-diy-hogar',
  vida: 'vida-cotidiana',
  entretenimiento: 'vida-cotidiana',
  juegos: 'vida-cotidiana',
  mascotas: 'mascotas',
  viajes: 'viajes',
  automotor: 'viajes',
  impuestos: 'impuestos-argentina-2026',
};

/**
 * Guías AR cross-category resueltas por patrón de slug (prioridad sobre la
 * categoría). Agrupan calcs que viven en categorías distintas — p. ej. una
 * calc de aguinaldo está en `finanzas` pero su hub correcto es Sueldos.
 * Patrones validados contra el catálogo real (sin falsos positivos masivos).
 */
const AR_NON_LOCAL = /mexico|espana|colombia|chile|peru|uruguay|bolivia|ecuador|usa|eeuu|premier/;
// "sueldo"/"salario" como input de gasto (no temática laboral) → excluir.
const SUELDO_EXCLUDE = /anillo|compromiso|gastar|regalo|cuanto-cuesta|precio-pareja|boda|luna-miel|emancipar|alimentos|pension-alimentaria|presupuesto|mba|minimo-para-alquilar|top-5-ligas/;

function arGuideFromSlug(slug: string): string | null {
  if (!slug || AR_NON_LOCAL.test(slug)) return null;
  // Sueldos y trabajo (LCT, paritarias, aguinaldo, indemnización, licencias)
  if (
    /aguinaldo|(^|-)sac(-|$)|indemnizac|despido|preaviso|liquidacion-final|antiguedad-laboral|paritaria|hora-extra|vacaciones-(no-tomadas|ganadas|ley|cct)|dias-vacaciones|licencia-(maternidad|paternidad|matrimonio|examen|fallecimiento|adopcion|vacaciones)/.test(slug) ||
    (/sueldo|salario/.test(slug) && !SUELDO_EXCLUDE.test(slug))
  ) {
    return 'sueldos-argentina-2026';
  }
  // Impuestos AR (monotributo, Ganancias, IVA, Bienes Personales)
  if (
    /monotributo|ganancias-(4|cuarta|sueldo|aguinaldo|segunda-categoria|monotributista)|cuarta-categoria|impuesto-a-las-ganancias|impuesto-ganancias|iibb|ingresos-brutos|(^|-)iva(-|$)|bienes-personales|impuesto-sellos|deduccion.*ganancias|retencion-ganancias|autonomos-categorias/.test(slug)
  ) {
    return 'impuestos-argentina-2026';
  }
  // ANSES / subsidios / previsional
  if (
    /jubilac|(^|-)anses|(^|-)auh(-|$)|asignacion-(universal|familiar)|moratoria-previsional|haber-(minimo|jubilatorio)|pension-(no-contributiva|invalidez|derechohabiente|anses|universal)|prestacion-desempleo|edad-jubilacion|cuanto-falta-jubilarse|comprar-anos-aportes|puam|pnc/.test(slug)
  ) {
    return 'subsidios-anses-2026';
  }
  // Inversión inmobiliaria (AR): alquiler, hipoteca, compraventa, rentabilidad.
  // Va al final: las tax-specific (deducción Ganancias, sellos como impuesto) ya
  // se resolvieron arriba a impuestos. Acá caen las de inversión/operación.
  if (
    /cap-rate|rentabilidad-alquiler|alquiler-(vs-comprar|temporal|icl)|actualizacion-alquiler|expensas-vs-alquiler|hipotec|comision-inmobiliaria|inmobiliari|tasacion-m2|propiedad-(tasacion|vacia)|costo-(total-comprar-propiedad|mantener-propiedad)|gastos-escritura-compra|sellos-inmobiliarios|sueldo-minimo-para-alquilar/.test(slug)
  ) {
    return 'inversion-inmobiliaria';
  }
  return null;
}

/**
 * Resuelve la guía pilar de una calc, en orden de prioridad:
 *   1. override manual `calc.guideSlug`
 *   2. patrón de slug (guías AR cross-category: sueldos / impuestos / ANSES)
 *   3. categoría → CATEGORY_TO_GUIDE
 * Devuelve null sólo si la calc no encaja en ningún hub.
 */
export function resolveGuideSlug(calc: { slug?: string; category?: string; guideSlug?: string }): string | null {
  if (calc.guideSlug) return calc.guideSlug;
  return arGuideFromSlug(calc.slug || '') || CATEGORY_TO_GUIDE[calc.category || ''] || null;
}

/** Títulos cortos para UI de links (evitar depender de carga JSON). */
export const GUIDE_TITLES: Record<string, string> = {
  'finanzas-personales': 'Finanzas personales',
  'marketing-roi-metricas': 'Marketing y ROI publicitario',
  'inversion-inmobiliaria': 'Inversión inmobiliaria',
  'salud-nutricion-fitness': 'Salud, nutrición y fitness',
  'embarazo-y-bebe': 'Embarazo y bebé',
  'productividad-aprendizaje': 'Productividad y aprendizaje',
  'matematicas-ciencias': 'Matemáticas y ciencias',
  'cocina-medidas-recetas': 'Cocina, medidas y recetas',
  'construccion-diy-hogar': 'Construcción, DIY y hogar',
  'impuestos-argentina-2026': 'Impuestos Argentina 2026',
  'subsidios-anses-2026': 'Subsidios ANSES 2026',
  'sueldos-argentina-2026': 'Sueldos Argentina 2026',
  'vida-cotidiana': 'Vida cotidiana y hogar',
  mascotas: 'Mascotas',
  viajes: 'Viajes y auto',
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
  'marketing-roi-metricas': ['marketing', 'negocios', 'finanzas'],
  'inversion-inmobiliaria': ['finanzas', 'negocios'],
  'salud-nutricion-fitness': ['salud', 'deportes'],
  'embarazo-y-bebe': ['familia', 'salud'],
  'productividad-aprendizaje': ['educacion', 'idiomas', 'tecnologia', 'electronica'],
  'matematicas-ciencias': ['matematica', 'ciencia', 'medio-ambiente'],
  'cocina-medidas-recetas': ['cocina'],
  'construccion-diy-hogar': ['construccion', 'jardineria', 'hogar'],
  'impuestos-argentina-2026': ['finanzas'],
  'subsidios-anses-2026': ['finanzas', 'familia'],
  'sueldos-argentina-2026': ['finanzas'],
  'vida-cotidiana': ['vida', 'entretenimiento'],
  mascotas: ['mascotas'],
  viajes: ['viajes', 'automotor'],
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
