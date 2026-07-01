/**
 * Registro de /informes — informes con datos propios de Hacé Cuentas.
 *
 * Dos tipos:
 *   · 'cooperativa'  — el dato vive en la cooperativa de datos anónimos
 *                      (src/lib/coop/datasets.ts). La página del informe carga
 *                      los agregados client-side desde /api/coop/stats (la API
 *                      es del mismo sitio, no está disponible en build), con un
 *                      estado estático "recolectando datos" como fallback.
 *   · 'metodologico' — el informe se calcula EN BUILD con las fórmulas reales
 *                      del repo (misma fuente que las calculadoras) → los
 *                      números se refrescan solos con cada deploy, nunca
 *                      divergen de lo que calcula el sitio.
 *
 * Lo consumen src/pages/informes/index.astro (hub) y
 * src/pages/informes/[slug].astro (getStaticPaths). TS puro, sin DOM.
 */

import { sueldoAR, BASE_IMPONIBLE_MAXIMA_APORTES } from '../formulas/sueldo-ar';

export interface Hallazgo {
  titulo: string;
  valor: string;
  detalle: string;
}

export interface Informe {
  slug: string;
  titulo: string;
  subtitulo: string;
  /** 2-3 oraciones citables (para meta description, resumen y schema). */
  resumen: string;
  /** cooperativa = datos de usuarios agregados; metodologico = calculado de datos oficiales. */
  tipo: 'cooperativa' | 'metodologico';
  /** id del dataset de la cooperativa si tipo=cooperativa (ver COOP_DATASETS). */
  coopDataset?: string;
  /** Markdown simple (párrafos separados por línea en blanco, viñetas con "- "). */
  metodologia: string;
  /** Hallazgos server-rendered (para tipo=metodologico). */
  hallazgosEstaticos?: Hallazgo[];
  fechaPublicacion: string;
  icon: string;
  /** Calculadora desde la que se aporta el dato (CTA del estado "recolectando"). */
  calcHref?: string;
  calcLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Brecha bruto-neto: calculada EN BUILD con la fórmula real del repo
// (src/lib/formulas/sueldo-ar.ts — la misma que usa /sueldo-en-mano-argentina).
// Escenario: empleado registrado, soltero, sin hijos, sin deducciones extra.
// Aportes 11% + 3% + 3% con tope de base imponible + Ganancias (escala ARCA
// 1er semestre 2026). Se recalcula con cada build → siempre en sync con la calc.
// ─────────────────────────────────────────────────────────────────────────────

export interface BrechaFila {
  bruto: number;
  aportes: number;
  ganancias: number;
  neto: number;
  /** Porcentaje del bruto que NO llega al bolsillo. */
  brechaPct: number;
}

const BRUTOS_EJEMPLO = [800_000, 1_500_000, 2_500_000, 4_000_000, 6_000_000];

export const BRECHA_FILAS: BrechaFila[] = BRUTOS_EJEMPLO.map((bruto) => {
  const r = sueldoAR({ bruto, conyuge: false, hijos: 0 });
  return {
    bruto,
    aportes: r.aportes,
    ganancias: r.ganancias,
    neto: r.neto,
    brechaPct: r.porcentajeDescuento,
  };
});

export { BASE_IMPONIBLE_MAXIMA_APORTES };

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const fmtPct = (n: number) => `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;

/** Hallazgos de la brecha, uno por bruto de ejemplo (números vivos de la fórmula). */
const HALLAZGOS_BRECHA: Hallazgo[] = BRECHA_FILAS.map((f) => ({
  titulo: `Bruto de ${fmtArs(f.bruto)}`,
  valor: fmtPct(f.brechaPct),
  detalle:
    f.ganancias > 0
      ? `Se descuentan ${fmtArs(f.aportes)} de aportes y ${fmtArs(f.ganancias)} de Ganancias: quedan ${fmtArs(f.neto)} en mano.`
      : `Se descuentan ${fmtArs(f.aportes)} de aportes (no paga Ganancias): quedan ${fmtArs(f.neto)} en mano.`,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Los informes
// ─────────────────────────────────────────────────────────────────────────────

export const INFORMES: Informe[] = [
  {
    slug: 'indice-capacidad-de-alquiler',
    titulo: 'Índice Hacé Cuentas de capacidad de alquiler',
    subtitulo: 'Qué porcentaje del ingreso destinan a alquiler los argentinos',
    resumen:
      'El Índice Hacé Cuentas de capacidad de alquiler mide qué porcentaje del ingreso neto del hogar se destina al alquiler en Argentina, a partir de aportes anónimos y voluntarios de inquilinos reales, segmentados por provincia y cantidad de ambientes. Es un termómetro de esfuerzo habitacional construido con datos primarios, no con avisos publicados. Cada segmento se publica recién cuando reúne al menos 30 observaciones.',
    tipo: 'cooperativa',
    coopDataset: 'alquiler-ingreso',
    metodologia: `El dato surge de la calculadora de actualización de alquiler (ICL): tras el cálculo, el usuario puede aportar de forma **anónima y voluntaria** cuánto paga de alquiler y cuál es el ingreso neto de su hogar. El valor publicado es el cociente alquiler ÷ ingreso, expresado en porcentaje.

- El aporte es opt-in explícito: nada se guarda sin marcar el consentimiento.
- El servidor descarta valores absurdos (ratio ≤ 0% o > 100%).
- Segmentación: provincia y cantidad de ambientes, elegidas por el usuario.
- Un segmento se publica sólo con **30 o más observaciones** (k-anonimato).
- Se reportan percentiles (p10, p25, mediana, p75, p90), media, mínimo y máximo.
- Cada dispositivo puede aportar una vez por segmento y por mes, y todo aporte es revocable.

Los agregados están disponibles vía la API pública /api/coop/stats?dataset=alquiler-ingreso y se actualizan a diario.`,
    fechaPublicacion: '2026-07-01',
    icon: '🏠',
    calcHref: '/calculadora-actualizacion-alquiler-icl',
    calcLabel: 'Calculadora de actualización de alquiler (ICL)',
  },
  {
    slug: 'indice-sueldo-neto',
    titulo: 'Índice Hacé Cuentas de sueldo neto',
    subtitulo: 'Cuánto cobra en mano el trabajador argentino según los usuarios de Hacé Cuentas',
    resumen:
      'El Índice Hacé Cuentas de sueldo neto releva cuánto cobra en mano el trabajador argentino a partir de aportes anónimos y voluntarios de usuarios reales, segmentados por área, seniority y provincia. A diferencia de las encuestas salariales tradicionales, el neto se recalcula en el servidor con la fórmula oficial de aportes y Ganancias, no se declara a mano. Ningún segmento se publica con menos de 30 aportes.',
    tipo: 'cooperativa',
    coopDataset: 'sueldo-neto',
    metodologia: `El dato surge de las calculadoras de sueldo en mano y de recibo de sueldo: tras el cálculo, el usuario puede aportar su sueldo neto de forma **anónima y voluntaria**, indicando área/rol, seniority y provincia (opcional).

- El servidor **reejecuta el cálculo** con los inputs para obtener el valor autoritativo — no confía en un número manipulable del lado del cliente.
- El aporte nunca se asocia a un email ni a una cuenta; no hay forma de unir un aporte con una persona.
- Un segmento se publica sólo con **30 o más observaciones** (k-anonimato).
- Se reportan percentiles (p10, p25, mediana, p75, p90), media, mínimo y máximo por segmento.
- Un aporte por dispositivo, por segmento y por mes; todo aporte es revocable.

Los agregados están disponibles vía la API pública /api/coop/stats?dataset=sueldo-neto y se actualizan a diario.`,
    fechaPublicacion: '2026-07-01',
    icon: '💵',
    calcHref: '/sueldo-en-mano-argentina',
    calcLabel: 'Calculadora de sueldo en mano',
  },
  {
    slug: 'tasa-real-plazo-fijo',
    titulo: 'La tasa que los bancos realmente pagan',
    subtitulo: 'TNA de plazo fijo declarada por los usuarios vs tasa publicada',
    resumen:
      'Este informe compara la TNA de plazo fijo que los bancos y billeteras ofrecen de verdad a sus clientes —declarada de forma anónima por usuarios de Hacé Cuentas— con las tasas publicadas oficialmente. La tasa efectivamente ofrecida suele diferir de la pizarra, y esa brecha varía por entidad y por plazo. Cada entidad se publica recién cuando reúne al menos 30 aportes.',
    tipo: 'cooperativa',
    coopDataset: 'tasa-plazo-fijo',
    metodologia: `El dato surge de la calculadora de plazo fijo: tras simular su inversión, el usuario puede aportar de forma **anónima y voluntaria** la TNA que su banco o billetera le ofreció realmente, indicando la entidad. El plazo se toma del propio cálculo y se agrupa en rangos (30, 60, 90, 180, +180 días).

- Se descartan valores fuera de rango (TNA ≤ 0% o > 500%).
- Segmentación: entidad (banco o billetera) y plazo agrupado.
- Un segmento se publica sólo con **30 o más observaciones** (k-anonimato).
- Se reportan percentiles (p10, p25, mediana, p75, p90), media, mínimo y máximo.
- Un aporte por dispositivo, por segmento y por mes; todo aporte es revocable.

Los agregados están disponibles vía la API pública /api/coop/stats?dataset=tasa-plazo-fijo y se actualizan a diario. Para comparar contra la tasa de pizarra se puede cruzar con las tasas publicadas por el BCRA.`,
    fechaPublicacion: '2026-07-01',
    icon: '🏦',
    calcHref: '/calculadora-plazo-fijo',
    calcLabel: 'Calculadora de plazo fijo',
  },
  {
    slug: 'brecha-bruto-neto',
    titulo: 'Cuánto se queda el Estado de tu sueldo',
    subtitulo: 'La brecha bruto-neto en Argentina 2026',
    resumen:
      'Un empleado registrado argentino resigna entre el 17% y más del 21% de su sueldo bruto entre aportes obligatorios e Impuesto a las Ganancias, según el nivel salarial. El piso del 17% (jubilación 11% + obra social 3% + PAMI 3%) aplica a todos los sueldos; a partir de cierto bruto se suma Ganancias y la brecha crece con el salario. Los números de este informe se calculan con la misma fórmula que usan las calculadoras de sueldo de Hacé Cuentas, con la escala ARCA vigente.',
    tipo: 'metodologico',
    metodologia: `Los números se calculan con la **fórmula real de sueldo neto de Hacé Cuentas** (la misma que usa la calculadora de sueldo en mano), en cada build del sitio — por eso nunca divergen de lo que calcula el sitio ni quedan desactualizados frente a la escala vigente.

Escenario modelado: empleado en relación de dependencia, **soltero, sin hijos**, sin deducciones adicionales (alquiler, prepaga, SiRADIG).

- Aportes personales: jubilación (SIPA) 11% + obra social 3% + PAMI 3% = 17% del bruto, con tope de base imponible máxima (Ley 24.241 art. 9).
- Impuesto a las Ganancias: deducciones del art. 30 (RG 4003) y escala progresiva del art. 94 LIG, valores ARCA del primer semestre 2026.
- La brecha se define como (bruto − neto) ÷ bruto, en porcentaje.

Fuentes primarias: escala y deducciones oficiales de ARCA (Ley 27.743, actualización semestral por IPC) y base imponible máxima de ANSES. Con cargas de familia o deducciones informadas, la brecha individual es menor.`,
    hallazgosEstaticos: HALLAZGOS_BRECHA,
    fechaPublicacion: '2026-07-01',
    icon: '🧾',
    calcHref: '/sueldo-en-mano-argentina',
    calcLabel: 'Calculadora de sueldo en mano',
  },
];

const BY_SLUG = new Map(INFORMES.map((i) => [i.slug, i]));

export function getInforme(slug: string): Informe | null {
  return BY_SLUG.get(slug) || null;
}
