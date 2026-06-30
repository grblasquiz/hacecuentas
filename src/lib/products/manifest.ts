/**
 * PRODUCTOS VERTICALES — "Mi Plata", "Mi Trabajo", "Mi Casa", "Mi Familia".
 *
 * Idea estratégica (Martin, 2026-06-30): no presentar las ~26 categorías como
 * productos equivalentes. Elegir 4 verticales con capacidad real de generar
 * HÁBITO y convertirlas en productos con recurrencia. Cada producto orquesta
 * piezas que ya existen:
 *
 *   - Estado persistente  -> perfil numérico (src/lib/profile + /api/profile)
 *   - Panel               -> la propia página /mi/<slug>
 *   - Alertas             -> result_alerts (src/lib/alerts + /api/alerts)
 *   - Historial           -> localStorage `hc-history-<slug>` que ya escribe Calculator
 *   - Próximos hitos       -> reglas de recurrencia (este archivo) computadas en cliente
 *   - Recomendaciones      -> salas de decisión (/decidir, DECISION_MANIFEST)
 *   - Herramientas         -> las calcs canónicas del vertical
 *   - Exportación          -> descarga JSON + imprimir
 *
 * Las demás calculadoras siguen captando demanda por SEO; estos 4 productos
 * definen la EXPERIENCIA DE MARCA principal.
 *
 * TS puro, sin DOM ni imports de runtime: se consume en build (render de las
 * páginas /mi y el sitemap) y como fuente de verdad para el script de cliente.
 * Todos los `slug` validados contra el catálogo real (campo `slug` del JSON).
 */

export type ProductId = 'plata' | 'trabajo' | 'casa' | 'familia';

export interface ProductTool {
  /** slug canónico del calc (campo `slug` del JSON, NO el filename). */
  slug: string;
  label: string;
}

/**
 * Regla de recurrencia de un hito. El cliente calcula la PRÓXIMA ocurrencia
 * ≥ hoy y los días que faltan; así nunca mostramos una fecha vencida ni
 * afirmamos un dato que pueda quedar viejo.
 */
export type MilestoneRule =
  | { type: 'monthly-last' } // último día de cada mes
  | { type: 'monthly-day'; day: number } // día N de cada mes
  | { type: 'yearly'; month: number; day: number } // mes 1-12
  | { type: 'biyearly'; month1: number; month2: number; day: number };

export interface ProductMilestone {
  id: string;
  emoji: string;
  label: string;
  detail: string;
  rule: MilestoneRule;
  /** Calc relacionado para el CTA del hito. */
  toolSlug?: string;
}

export interface Product {
  id: ProductId;
  /** Segmento de URL: /mi/<slug>. */
  slug: ProductId;
  /** Nombre de marca del producto. */
  name: string;
  tagline: string;
  icon: string;
  /** Color de acento del producto (hex). */
  accent: string;
  /** Meta description (SEO). */
  description: string;
  /** Propuesta de valor (1 párrafo, render server-side). */
  intro: string;
  /** Claves canónicas del perfil relevantes a este vertical (Estado). */
  profileKeys: string[];
  /** Subconjunto de profileKeys que se muestran como números destacados. */
  keyMetrics: string[];
  /** Calcs del vertical (la "categoría como producto"). */
  tools: ProductTool[];
  /** Salas de decisión relacionadas (slugs de DECISION_MANIFEST). */
  salas: string[];
  /** Slugs elegibles para alerta que pertenecen a este vertical. */
  alertSlugs: string[];
  /** Hitos recurrentes (Timeline / Próximos hitos). */
  milestones: ProductMilestone[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'plata',
    slug: 'plata',
    name: 'Mi Plata',
    tagline: 'Tu dinero, mes a mes',
    icon: '💰',
    accent: '#0ea66e',
    description:
      'Tu centro de finanzas personales: presupuesto, sueldo vs inflación, deudas, ahorro y metas. Con seguimiento mensual, alertas y tu perfil que precarga todo.',
    intro:
      'Mi Plata junta en un solo lugar las cuentas que repetís todos los meses: cuánto podés gastar, cómo viene tu sueldo contra la inflación, el plan para salir de deudas y cuánto te falta para tu meta de ahorro. Cargás tus números una vez y vuelven a aparecer cada vez, con alertas cuando algo cambia.',
    profileKeys: ['trabajo.sueldoNeto', 'gastos.recurrentesMensual', 'finanzas.ahorros', 'finanzas.deudas', 'moneda.principal'],
    keyMetrics: ['finanzas.ahorros', 'finanzas.deudas', 'trabajo.sueldoNeto'],
    tools: [
      { slug: 'calculadora-presupuesto-50-30-20-familiar-sueldo', label: 'Presupuesto 50/30/20' },
      { slug: 'calculadora-ajuste-sueldo-inflacion', label: 'Tu sueldo vs inflación' },
      { slug: 'calculadora-deuda-bola-nieve', label: 'Plan para salir de deudas' },
      { slug: 'calculadora-ahorro-meta-mensual', label: 'Meta de ahorro' },
      { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
      { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
      { slug: 'calculadora-fondo-emergencia-meses', label: 'Fondo de emergencia' },
      { slug: 'calculadora-regla-72-duplicar-dinero', label: 'Regla del 72' },
    ],
    salas: [
      'cuanto-puedo-gastar-por-mes',
      'como-salir-de-deudas',
      'que-hago-con-mis-ahorros',
      'cual-es-mi-salud-financiera',
      'cuando-alcanzo-mi-meta-de-ahorro',
      'cuanto-fondo-de-emergencia-necesito',
    ],
    alertSlugs: ['calculadora-plazo-fijo'],
    milestones: [
      {
        id: 'cierre-mes',
        emoji: '📆',
        label: 'Cierre de mes',
        detail: 'Revisá cuánto gastaste y cuánto ahorraste este mes con tu presupuesto.',
        rule: { type: 'monthly-last' },
        toolSlug: 'calculadora-presupuesto-50-30-20-familiar-sueldo',
      },
    ],
  },
  {
    id: 'trabajo',
    slug: 'trabajo',
    name: 'Mi Trabajo',
    tagline: 'Sueldo, recibo y derechos',
    icon: '💼',
    accent: '#2563eb',
    description:
      'Sueldo neto, recibo, Ganancias, aguinaldo, vacaciones, horas extra y liquidación. Tu perfil precarga sueldo y antigüedad, y te avisamos cuando cambia una paritaria o la escala de Ganancias.',
    intro:
      'Mi Trabajo es tu carpeta laboral: tu sueldo en mano, el recibo, cuánto te retienen de Ganancias, el aguinaldo, las vacaciones que te corresponden y lo que te toca si te vas. Cargás tu sueldo y tu antigüedad una sola vez y todas las cuentas quedan listas, con aviso cuando una paritaria o la escala de Ganancias mueven tu número.',
    profileKeys: [
      'trabajo.situacionLaboral',
      'trabajo.sueldoBruto',
      'trabajo.sueldoNeto',
      'trabajo.tipoContratacion',
      'trabajo.fechaIngreso',
      'trabajo.antiguedadAnios',
      'trabajo.convenio',
      'familia.dependientes',
      'familia.conyugeACargo',
    ],
    keyMetrics: ['trabajo.sueldoNeto', 'trabajo.sueldoBruto', 'trabajo.antiguedadAnios'],
    tools: [
      { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano' },
      { slug: 'simulador-recibo-de-sueldo-argentina', label: 'Recibo de sueldo' },
      { slug: 'calculadora-impuesto-ganancias-sueldo', label: 'Impuesto a las Ganancias' },
      { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
      { slug: 'calculadora-dias-vacaciones-ganadas-antiguedad-lct', label: 'Días de vacaciones' },
      { slug: 'calculadora-horas-extra', label: 'Horas extra' },
      { slug: 'calculadora-liquidacion-final-renuncia', label: 'Liquidación final' },
      { slug: 'calculadora-monotributo-2026', label: 'Monotributo' },
      { slug: 'calculadora-paritaria-comercio-2026-aumento-acumulado', label: 'Paritaria de comercio' },
    ],
    salas: [
      'aceptar-oferta-laboral',
      'cuanto-aumento-pedir',
      'cuanto-cambia-mi-sueldo-con-la-paritaria',
      'me-despidieron',
      'relacion-dependencia-o-facturar',
      'cuanto-vale-mi-hora',
    ],
    alertSlugs: [
      'sueldo-en-mano-argentina',
      'calculadora-impuesto-ganancias-sueldo',
      'calculadora-aguinaldo-sac',
      'simulador-recibo-de-sueldo-argentina',
      'calculadora-sueldo-bruto-desde-neto',
      'calculadora-monotributo-2026',
      'simulador-monotributo-neto',
      'calculadora-sueldo-empleados-comercio-cct-130-75',
    ],
    milestones: [
      {
        id: 'sac-2',
        emoji: '🎁',
        label: 'Aguinaldo — 2ª cuota',
        detail: 'El medio aguinaldo de fin de año se paga antes del 18 de diciembre.',
        rule: { type: 'yearly', month: 12, day: 18 },
        toolSlug: 'calculadora-aguinaldo-sac',
      },
      {
        id: 'monotributo-recat',
        emoji: '🧾',
        label: 'Recategorización de monotributo',
        detail: 'ARCA recategoriza en enero y julio. Revisá tu facturación de los últimos 12 meses.',
        rule: { type: 'biyearly', month1: 1, month2: 7, day: 20 },
        toolSlug: 'calculadora-monotributo-2026',
      },
    ],
  },
  {
    id: 'casa',
    slug: 'casa',
    name: 'Mi Casa',
    tagline: 'Alquiler, crédito y gastos',
    icon: '🏠',
    accent: '#d97706',
    description:
      'Actualización de alquiler por ICL, cuota del crédito UVA, gastos de comprar, escritura y mudanza. Con tu alquiler precargado y aviso cuando el índice del BCRA cambia tu cuota.',
    intro:
      'Mi Casa reúne todo lo de tu vivienda: cuánto pasa a valer tu alquiler con el ICL, cómo viene la cuota de tu crédito UVA, cuánto cuesta de verdad comprar (con escritura y gastos) y qué sale una mudanza. Cargás tu alquiler una vez y te avisamos cada mes cuando el índice del BCRA actualiza el número.',
    profileKeys: ['vivienda.tipo', 'vivienda.alquilerMensual', 'ubicacion.provincia'],
    keyMetrics: ['vivienda.alquilerMensual'],
    tools: [
      { slug: 'calculadora-actualizacion-alquiler-icl', label: 'Actualización de alquiler (ICL)' },
      { slug: 'calculadora-credito-uva-cuota-actual', label: 'Cuota de crédito UVA' },
      { slug: 'calculadora-costo-total-comprar-propiedad-gastos', label: 'Gastos de comprar' },
      { slug: 'calculadora-gastos-escritura-compraventa', label: 'Gastos de escritura' },
      { slug: 'calculadora-costo-estimado-mudanza', label: 'Costo de mudanza' },
    ],
    salas: [
      'alquilar-o-comprar',
      'puedo-afrontar-un-credito-uva',
      'renovar-alquiler-o-mudarme',
      'cuanto-alquiler-puedo-pagar',
      'refaccionar-o-mudarme',
      'cuanto-cuesta-comprar-una-propiedad',
    ],
    alertSlugs: ['calculadora-actualizacion-alquiler-icl'],
    milestones: [
      {
        id: 'icl-mes',
        emoji: '🏠',
        label: 'Actualización del alquiler (ICL)',
        detail: 'Si tu contrato ajusta por ICL, el índice del BCRA cambia todos los meses.',
        rule: { type: 'monthly-day', day: 1 },
        toolSlug: 'calculadora-actualizacion-alquiler-icl',
      },
    ],
  },
  {
    id: 'familia',
    slug: 'familia',
    name: 'Mi Familia',
    tagline: 'Embarazo, hijos y licencias',
    icon: '👨‍👩‍👧',
    accent: '#db2777',
    description:
      'Semanas de embarazo, calendario de vacunas, licencia por maternidad, percentil de crecimiento, leche y asignaciones. Las cuentas de la familia, ordenadas y con sus fechas.',
    intro:
      'Mi Familia acompaña las etapas: las semanas de embarazo, el calendario de vacunas del bebé, la licencia por maternidad, el percentil de crecimiento y las asignaciones que te corresponden. Las cuentas de criar, ordenadas en un solo lugar y con sus fechas a la vista.',
    profileKeys: ['familia.dependientes', 'familia.conyugeACargo'],
    keyMetrics: ['familia.dependientes'],
    tools: [
      { slug: 'calculadora-semanas-meses-trimestres-embarazo', label: 'Semanas de embarazo' },
      { slug: 'calculadora-vacunas-bebe-calendario-2026-argentina-edad', label: 'Calendario de vacunas' },
      { slug: 'calculadora-licencia-maternidad-anses-90-dias-extension', label: 'Licencia por maternidad' },
      { slug: 'calculadora-percentil-bebe-oms', label: 'Percentil de crecimiento' },
      { slug: 'calculadora-formula-leche-bebe-litros-mes-edad-marca', label: 'Leche por mes' },
      { slug: 'calculadora-asignacion-familiar-hijo-anses-tramo', label: 'Asignación familiar' },
    ],
    salas: [
      'cuanto-cuesta-tener-un-hijo-primer-ano',
      'como-cambia-mi-presupuesto-con-un-hijo',
      'guarderia-o-reducir-horas',
      'cuanto-ahorrar-para-la-educacion-de-mis-hijos',
      'podemos-vivir-con-un-solo-ingreso',
      'podemos-afrontar-este-viaje-familiar',
    ],
    alertSlugs: [],
    milestones: [
      {
        id: 'ayuda-escolar',
        emoji: '🎒',
        label: 'Ayuda escolar anual (ANSES)',
        detail: 'Se paga al inicio del ciclo lectivo, en marzo, para quienes cobran asignaciones.',
        rule: { type: 'yearly', month: 3, day: 1 },
        toolSlug: 'calculadora-asignacion-familiar-hijo-anses-tramo',
      },
    ],
  },
];

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | null {
  return BY_SLUG.get(slug as ProductId) || null;
}

/** Mapa slug-de-calc -> producto al que pertenece (para badges / cross-links). */
export const PRODUCT_BY_TOOL_SLUG: ReadonlyMap<string, ProductId> = (() => {
  const m = new Map<string, ProductId>();
  for (const p of PRODUCTS) for (const t of p.tools) if (!m.has(t.slug)) m.set(t.slug, p.id);
  return m;
})();
