/**
 * PRESENTACIÓN del dashboard de producto (/mi/<slug>) — capa de UI del mockup
 * "Mi Casa / Mi Plata" (Martin, 2026-07-12).
 *
 * Separado de `manifest.ts` a propósito: el manifest es la FUENTE DE VERDAD
 * (slugs validados contra el catálogo, hitos, alertas). Acá vive sólo el copy y
 * los colores del rediseño — hero navy/verde por producto, eyebrows, íconos de
 * herramienta, textos de la barra superior y de las tarjetas. Cambiar esto no
 * puede romper el sitemap ni el precargado; sólo cambia cómo se ve el panel.
 *
 * TS puro (sin DOM): se consume en build al renderizar /mi/<slug>.
 */

import type { ProductId } from './manifest';

/** Set de íconos de línea (stroke=currentColor). Compacto y reutilizable. */
export const ICONS: Record<string, string> = {
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>',
  trendingDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 6 6 4-4 8 8"/><path d="M17 17h4v-4"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/></svg>',
  percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>',
  coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.3-1.6-2.4-3.8-2.8"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10"/><path d="m5 7 14-2"/><path d="M5 7 2.5 13a3 3 0 0 0 5 0zM19 5l-2.5 6a3 3 0 0 0 5 0z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7S9.5 3 7.5 4.5 8 7 12 7zM12 7s2.5-4 4.5-2.5S16 7 12 7z"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z"/><path d="M9 8h6M9 12h6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
  baby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/><path d="M6 12c2 2 4 3 6 3s4-1 6-3"/></svg>',
  growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><rect x="5" y="13" width="3.5" height="6"/><rect x="10.2" y="9" width="3.5" height="10"/><rect x="15.5" y="5" width="3.5" height="14"/></svg>',
  bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v2.5c0 .8-.4 1.5-1 2A4 4 0 0 0 7 11v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8a4 4 0 0 0-2-3.5c-.6-.5-1-1.2-1-2V3"/><path d="M7 12h4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M4 4.5v15"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><path d="M17 13h.01"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
};

/** Ícono de cada tab (barra "Mis productos"). */
export const TAB_ICON: Record<ProductId, string> = {
  casa: 'home',
  plata: 'wallet',
  trabajo: 'briefcase',
  familia: 'heart',
};

/** Orden fijo de los tabs (como el mockup: Casa · Plata · Trabajo · Familia). */
export const TAB_ORDER: ProductId[] = ['casa', 'plata', 'trabajo', 'familia'];

/** Metadata visual de cada herramienta (por slug canónico). desc corta + ícono. */
export const TOOL_META: Record<string, { desc: string; icon: string }> = {
  // — Mi Casa —
  'calculadora-actualizacion-alquiler-icl': { desc: 'Calculá el nuevo valor según BCRA.', icon: 'refresh' },
  'calculadora-credito-uva-cuota-actual': { desc: 'Actualizá capital y cuota.', icon: 'home' },
  'calculadora-costo-total-comprar-propiedad-gastos': { desc: 'Escritura, comisión e impuestos.', icon: 'coins' },
  'calculadora-gastos-escritura-compraventa': { desc: 'Estimación por jurisdicción.', icon: 'doc' },
  'calculadora-costo-estimado-mudanza': { desc: 'Distancia, volumen y adicionales.', icon: 'box' },
  // — Mi Plata —
  'calculadora-presupuesto-50-30-20-familiar-sueldo': { desc: 'Distribuí ingresos y compará gastos.', icon: 'list' },
  'calculadora-ajuste-sueldo-inflacion': { desc: 'Medí tu poder adquisitivo real.', icon: 'trendingUp' },
  'calculadora-deuda-bola-nieve': { desc: 'Bola de nieve o avalancha.', icon: 'trendingDown' },
  'calculadora-ahorro-meta-mensual': { desc: 'Aporte mensual y fecha objetivo.', icon: 'target' },
  'calculadora-interes-compuesto': { desc: 'Proyectá el crecimiento del capital.', icon: 'percent' },
  'calculadora-plazo-fijo': { desc: 'Interés y total al vencimiento.', icon: 'coins' },
  'calculadora-fondo-emergencia-meses': { desc: 'Meses de cobertura recomendados.', icon: 'shield' },
  'calculadora-regla-72-duplicar-dinero': { desc: 'En cuánto duplicás tu dinero.', icon: 'refresh' },
  // — Mi Trabajo —
  'sueldo-en-mano-argentina': { desc: 'Tu neto real de bolsillo.', icon: 'wallet' },
  'simulador-recibo-de-sueldo-argentina': { desc: 'Recibo desglosado ítem por ítem.', icon: 'receipt' },
  'calculadora-impuesto-ganancias-sueldo': { desc: 'Cuánto te retienen del sueldo.', icon: 'percent' },
  'calculadora-aguinaldo-sac': { desc: 'Medio aguinaldo por semestre.', icon: 'gift' },
  'calculadora-dias-vacaciones-ganadas-antiguedad-lct': { desc: 'Días según tu antigüedad.', icon: 'calendar' },
  'calculadora-horas-extra': { desc: 'Al 50% y al 100%.', icon: 'clock' },
  'calculadora-indemnizacion-despido': { desc: 'Lo que te corresponde si te echan.', icon: 'scale' },
  'calculadora-liquidacion-final-renuncia': { desc: 'Todo lo que te queda al irte.', icon: 'doc' },
  'calculadora-monotributo-2026': { desc: 'Categoría y cuota mensual.', icon: 'receipt' },
  'calculadora-paritaria-comercio-2026-aumento-acumulado': { desc: 'Aumento acumulado del CCT.', icon: 'trendingUp' },
  // — Mi Familia —
  'calculadora-semanas-meses-trimestres-embarazo': { desc: 'En qué semana y trimestre estás.', icon: 'baby' },
  'calculadora-vacunas-bebe-calendario-2026-argentina-edad': { desc: 'Qué toca según la edad.', icon: 'calendar' },
  'calculadora-licencia-maternidad-anses-90-dias-extension': { desc: 'Días y fechas de tu licencia.', icon: 'clock' },
  'calculadora-percentil-bebe-oms': { desc: 'Percentil de peso y talla (OMS).', icon: 'growth' },
  'calculadora-formula-leche-bebe-litros-mes-edad-marca': { desc: 'Litros y latas por mes.', icon: 'bottle' },
  'calculadora-asignacion-familiar-hijo-anses-tramo': { desc: 'Tramo y monto que cobrás.', icon: 'coins' },
};

/** Eyebrow corto de cada sala de decisión (por slug). */
export const SALA_EYEBROW: Record<string, string> = {
  // Casa
  'alquilar-o-comprar': 'Comprar o alquilar',
  'puedo-afrontar-un-credito-uva': 'Crédito',
  'renovar-alquiler-o-mudarme': 'Alquiler',
  'cuanto-alquiler-puedo-pagar': 'Presupuesto',
  'refaccionar-o-mudarme': 'Reforma',
  'cuanto-cuesta-comprar-una-propiedad': 'Compra',
  // Plata
  'cuanto-puedo-gastar-por-mes': 'Presupuesto',
  'como-salir-de-deudas': 'Deudas',
  'que-hago-con-mis-ahorros': 'Ahorro',
  'cual-es-mi-salud-financiera': 'Diagnóstico',
  'cuando-alcanzo-mi-meta-de-ahorro': 'Meta',
  'cuanto-fondo-de-emergencia-necesito': 'Emergencia',
  // Trabajo
  'aceptar-oferta-laboral': 'Oferta',
  'cuanto-aumento-pedir': 'Aumento',
  'cuanto-cambia-mi-sueldo-con-la-paritaria': 'Paritaria',
  'me-despidieron': 'Despido',
  'relacion-dependencia-o-facturar': 'Modalidad',
  'cuanto-vale-mi-hora': 'Tarifa',
  // Familia
  'cuanto-cuesta-tener-un-hijo-primer-ano': 'Primer año',
  'como-cambia-mi-presupuesto-con-un-hijo': 'Presupuesto',
  'guarderia-o-reducir-horas': 'Cuidado',
  'cuanto-ahorrar-para-la-educacion-de-mis-hijos': 'Educación',
  'podemos-vivir-con-un-solo-ingreso': 'Ingreso',
  'podemos-afrontar-este-viaje-familiar': 'Viaje',
};

export interface DashStat {
  /** 'metric' lee un keyMetric del perfil; 'milestone' muestra el próximo hito;
   *  'tools' cuenta las herramientas del producto. */
  kind: 'metric' | 'milestone' | 'tools';
  metricKey?: string;
  label: string;
  sub: string;
  action: string;
}

export interface DashSituation {
  label: string;
  icon: string;
  /** Clave de perfil para el texto principal (con fallback al mockup). */
  primaryKey?: string;
  primaryFallback: string;
  secondary: string;
  /** Barra segmentada (sólo Mi Plata en el mockup). */
  bar?: { label: string; pct: number; color: string }[];
}

export interface DashProduct {
  eyebrow: string;
  heroDesc: string;
  /** Gradiente oscuro del hero + de la tarjeta de decisiones. */
  hero: string;
  glow: string;
  situation: DashSituation;
  stats: [DashStat, DashStat, DashStat];
  topbarLeft: string;
  topbarLeftSub: string;
  topbarRight: string;
  toolsTitle: string;
  toolsSub: string;
  decisionsTitle: string;
  decisionsSub: string;
  profileTitle: string;
  privacyNote: string;
  nextSub: string;
  alertPreview: { icon: string; title: string; sub: string };
}

export const DASH: Record<ProductId, DashProduct> = {
  casa: {
    eyebrow: 'Tu centro de vivienda',
    heroDesc: 'Alquiler, crédito, gastos y decisiones de vivienda en un solo lugar, con tus datos listos para usar.',
    hero: 'linear-gradient(125deg, #1a2140 0%, #232152 55%, #2c2358 100%)',
    glow: 'rgba(217,119,6,.28)',
    situation: {
      label: 'Situación actual',
      icon: 'home',
      primaryKey: 'vivienda.tipo',
      primaryFallback: 'Alquilando',
      secondary: 'Buenos Aires · ICL',
    },
    stats: [
      { kind: 'metric', metricKey: 'vivienda.alquilerMensual', label: 'Alquiler mensual', sub: 'Contrato con ajuste ICL', action: 'Editar' },
      { kind: 'milestone', label: 'Próximo hito', sub: 'Actualización del alquiler', action: 'Calcular' },
      { kind: 'tools', label: 'Herramientas listas', sub: 'Precargadas con tu perfil', action: 'Explorar' },
    ],
    topbarLeft: 'Todo sincronizado',
    topbarLeftSub: 'Tus datos están actualizados',
    topbarRight: 'Privado · Exportable · Bajo tu control',
    toolsTitle: 'Herramientas para tu casa',
    toolsSub: 'Ya aparecen precargadas con los datos de tu perfil.',
    decisionsTitle: 'Decisiones de vivienda',
    decisionsSub: 'Cuando necesitás una recomendación y no sólo un resultado.',
    profileTitle: 'Datos de vivienda',
    privacyNote: 'Todo bajo tu control.',
    nextSub: 'Lo más importante de tu vivienda ahora.',
    alertPreview: { icon: 'refresh', title: 'Actualización mensual ICL', sub: 'Te avisamos cuando el BCRA publique el índice aplicable.' },
  },
  plata: {
    eyebrow: 'Tu centro financiero personal',
    heroDesc: 'Ingresos, gastos, ahorros y deudas organizados para que cada cálculo empiece con tus números reales.',
    hero: 'linear-gradient(125deg, #0d3b2c 0%, #0b2a20 60%, #09221a 100%)',
    glow: 'rgba(14,166,110,.30)',
    situation: {
      label: 'Balance mensual',
      icon: 'wallet',
      primaryFallback: 'Con margen',
      secondary: 'Ingresos por encima de gastos',
      bar: [
        { label: 'Necesidades', pct: 50, color: '#0ea66e' },
        { label: 'Deseos', pct: 30, color: '#38bdf8' },
        { label: 'Ahorro', pct: 20, color: '#818cf8' },
      ],
    },
    stats: [
      { kind: 'metric', metricKey: 'trabajo.sueldoNeto', label: 'Sueldo neto', sub: 'Ingreso mensual principal', action: 'Editar' },
      { kind: 'metric', metricKey: 'finanzas.ahorros', label: 'Ahorros disponibles', sub: 'Capital declarado', action: 'Actualizar' },
      { kind: 'metric', metricKey: 'finanzas.deudas', label: 'Deudas totales', sub: 'Saldo pendiente', action: 'Ver plan' },
    ],
    topbarLeft: 'Todo sincronizado',
    topbarLeftSub: 'Perfil financiero actualizado',
    topbarRight: 'Tus montos no se envían a analytics',
    toolsTitle: 'Herramientas para tu plata',
    toolsSub: 'Precargadas con tus datos financieros.',
    decisionsTitle: 'Decisiones financieras',
    decisionsSub: 'Salas que combinan varias cuentas y te dan un camino concreto.',
    profileTitle: 'Perfil financiero',
    privacyNote: 'Montos financieros protegidos.',
    nextSub: 'El cierre financiero más cercano.',
    alertPreview: { icon: 'trendingUp', title: 'Nuevo IPC mensual INDEC', sub: 'Te avisamos cuando puedas actualizar la comparación de tu sueldo.' },
  },
  trabajo: {
    eyebrow: 'Tu centro laboral',
    heroDesc: 'Sueldo, recibo, Ganancias, aguinaldo y liquidación, con tu antigüedad y convenio listos para calcular.',
    hero: 'linear-gradient(125deg, #12224c 0%, #16274f 60%, #1b3061 100%)',
    glow: 'rgba(37,99,235,.30)',
    situation: {
      label: 'Situación laboral',
      icon: 'briefcase',
      primaryKey: 'trabajo.situacionLaboral',
      primaryFallback: 'En relación de dependencia',
      secondary: 'Convenio y antigüedad cargados',
    },
    stats: [
      { kind: 'metric', metricKey: 'trabajo.sueldoNeto', label: 'Sueldo neto', sub: 'Lo que cobrás en mano', action: 'Editar' },
      { kind: 'metric', metricKey: 'trabajo.sueldoBruto', label: 'Sueldo bruto', sub: 'Antes de descuentos', action: 'Editar' },
      { kind: 'milestone', label: 'Próximo hito', sub: 'Fecha laboral relevante', action: 'Calcular' },
    ],
    topbarLeft: 'Todo sincronizado',
    topbarLeftSub: 'Perfil laboral actualizado',
    topbarRight: 'Privado · Exportable · Bajo tu control',
    toolsTitle: 'Herramientas para tu trabajo',
    toolsSub: 'Precargadas con tu sueldo y tu antigüedad.',
    decisionsTitle: 'Decisiones laborales',
    decisionsSub: 'Cuando hay que decidir y no sólo liquidar un número.',
    profileTitle: 'Datos laborales',
    privacyNote: 'Tu sueldo, sólo tuyo.',
    nextSub: 'La próxima fecha laboral que te toca.',
    alertPreview: { icon: 'trendingUp', title: 'Paritaria y escala de Ganancias', sub: 'Te avisamos cuando un cambio mueva tu sueldo de bolsillo.' },
  },
  familia: {
    eyebrow: 'Tu centro familiar',
    heroDesc: 'Embarazo, hijos, licencias y asignaciones, con las cuentas de criar ordenadas y con sus fechas.',
    hero: 'linear-gradient(125deg, #3a1330 0%, #2c1430 60%, #241134 100%)',
    glow: 'rgba(219,39,119,.30)',
    situation: {
      label: 'Tu familia',
      icon: 'baby',
      primaryFallback: 'En familia',
      secondary: 'Personas a cargo cargadas',
    },
    stats: [
      { kind: 'metric', metricKey: 'familia.dependientes', label: 'Personas a cargo', sub: 'Hijos y dependientes', action: 'Editar' },
      { kind: 'milestone', label: 'Próximo hito', sub: 'Fecha familiar relevante', action: 'Calcular' },
      { kind: 'tools', label: 'Herramientas listas', sub: 'Precargadas con tu perfil', action: 'Explorar' },
    ],
    topbarLeft: 'Todo sincronizado',
    topbarLeftSub: 'Perfil familiar actualizado',
    topbarRight: 'Privado · Exportable · Bajo tu control',
    toolsTitle: 'Herramientas para tu familia',
    toolsSub: 'Las cuentas de criar, precargadas y ordenadas.',
    decisionsTitle: 'Decisiones de familia',
    decisionsSub: 'Salas que corren todos los números de una decisión familiar.',
    profileTitle: 'Datos de familia',
    privacyNote: 'Datos sensibles, protegidos.',
    nextSub: 'La próxima fecha familiar que se viene.',
    alertPreview: { icon: 'calendar', title: 'Asignaciones y ayuda escolar ANSES', sub: 'Te avisamos cuando cambie un monto o se acerque una fecha.' },
  },
};
