// ─────────────────────────────────────────────────────────────────────────────
// Export de datos descargables para las páginas /datos-* .
//
// Cada builder arma la MISMA tabla que renderiza su página /datos-*, importando
// las fuentes únicas de verdad → la descarga (JSON/CSV) nunca diverge del HTML.
//
// Lo consumen los endpoints estáticos src/pages/datos/[slug].json.ts y .csv.ts,
// cuyas URLs alimentan el `distribution` (DataDownload) del schema Dataset de
// cada página → habilita la elegibilidad en Google Dataset Search.
// ─────────────────────────────────────────────────────────────────────────────
import {
  CATEGORIAS, TOPES, CUOTA_SERVICIOS, CUOTA_BIENES, componentes, META as MONO_META,
} from './data/monotributo-2026';
import {
  ESCALA, MNI_MENSUAL_BASE, INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL, INCREMENTO_HIJO_INCAPACITADO_MENSUAL,
} from './formulas/_ganancias-escala';
import { sueldoAR, BASE_IMPONIBLE_MAXIMA_APORTES } from './formulas/sueldo-ar';
import { aguinaldo } from './formulas/aguinaldo';
import { salarioMinimo } from './formulas/salario-minimo';
import { SALARIO_MINIMO as SM_BR } from './data/brasil-2026';
import { PERU_2026 } from './data/peru-2026';
import { ECUADOR_2026 } from './data/ecuador-2026';

type Cell = string | number | boolean | null;

export interface DatosExport {
  /** Metadatos de cita, embebidos como `$meta` en el JSON. */
  meta: {
    name: string;
    description: string;
    datasetPage: string;
    source: string;
    sourceUrl: string | null;
    temporalCoverage: string;
    lastReviewed: string;
    license: string;
    attribution: string;
    homepage: string;
  };
  /** Columnas (snake_case) de la tabla principal — base del CSV. */
  columns: string[];
  /** Filas de la tabla principal. */
  data: Record<string, Cell>[];
  /** Tablas/objetos adicionales, solo en el JSON (no en el CSV). */
  extra?: Record<string, unknown>;
  /** Variables medidas, para `variableMeasured` del schema Dataset. */
  variableMeasured: string[];
}

const HOMEPAGE = 'https://hacecuentas.com';
const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
const fin = (n: number): number | null => (Number.isFinite(n) ? n : null);
const round2 = (n: number) => Math.round(n * 100) / 100;

// ── Argentina · Monotributo 2026 ─────────────────────────────────────────────
export function buildMonotributo(): DatosExport {
  const data = CATEGORIAS.map((cat) => {
    const d = componentes(cat, 'servicios');
    return {
      categoria: cat,
      tope_anual_ars: TOPES[cat],
      tope_mensual_prom_ars: round2(TOPES[cat] / 12),
      cuota_servicios_ars: CUOTA_SERVICIOS[cat],
      cuota_bienes_ars: CUOTA_BIENES[cat],
      impuesto_integrado_ars: d.integrado,
      sipa_ars: d.sipa,
      obra_social_ars: d.obraSocial,
    };
  });
  return {
    meta: {
      name: 'Monotributo Argentina 2026 — categorías, topes y cuotas',
      description:
        'Las 11 categorías del monotributo argentino 2026 (A a K): tope de facturación anual y mensual, cuota mensual de servicios y de venta de bienes, y desglose en impuesto integrado, SIPA y obra social.',
      datasetPage: `${HOMEPAGE}/datos-monotributo-2026`,
      source: 'ARCA (ex AFIP)',
      sourceUrl: MONO_META.fuenteUrl,
      temporalCoverage: '2026',
      lastReviewed: '2026-06-06',
      license: LICENSE,
      attribution: 'Hacé Cuentas — https://hacecuentas.com/datos-monotributo-2026',
      homepage: HOMEPAGE,
    },
    columns: [
      'categoria', 'tope_anual_ars', 'tope_mensual_prom_ars',
      'cuota_servicios_ars', 'cuota_bienes_ars',
      'impuesto_integrado_ars', 'sipa_ars', 'obra_social_ars',
    ],
    data,
    variableMeasured: [
      'Tope de facturación anual (ARS)', 'Cuota mensual servicios (ARS)',
      'Cuota mensual venta de bienes (ARS)', 'Impuesto integrado (ARS)',
      'Aporte SIPA (ARS)', 'Aporte obra social (ARS)',
    ],
  };
}

// ── Argentina · Impuesto a las Ganancias 2026 ────────────────────────────────
export function buildGanancias(): DatosExport {
  const escala = ESCALA.map((t, i) => ({
    desde_ars: i === 0 ? 0 : fin(ESCALA[i - 1].hasta),
    hasta_ars: fin(t.hasta),
    alicuota_marginal: t.tasa,
    monto_fijo_acumulado_ars: t.acumulado,
  }));
  const deducciones = [
    { concepto: 'Ganancia no imponible (inc. a)', mensual_ars: null, anual_oficial: '$5.151.802,50' },
    { concepto: 'Deducción especial empleados (inc. c.1)', mensual_ars: null, anual_oficial: '$18.031.308,76' },
    { concepto: 'GNI + deducción especial (mínimo soltero)', mensual_ars: MNI_MENSUAL_BASE, anual_oficial: '$23.183.111,26' },
    { concepto: 'Cónyuge a cargo (inc. b.1)', mensual_ars: INCREMENTO_CONYUGE_MENSUAL, anual_oficial: '$4.851.964,66' },
    { concepto: 'Hijo a cargo (inc. b.2)', mensual_ars: INCREMENTO_HIJO_MENSUAL, anual_oficial: '$2.446.863,48' },
    { concepto: 'Hijo incapacitado (inc. b.2.1)', mensual_ars: INCREMENTO_HIJO_INCAPACITADO_MENSUAL, anual_oficial: '$4.893.726,96' },
  ];
  const ejemplos = [2_500_000, 3_000_000, 4_000_000, 5_000_000, 7_000_000, 10_000_000].map((bruto) => {
    const r = sueldoAR({ bruto, conyuge: false, hijos: 0 });
    return {
      bruto_mensual_ars: bruto, ganancias_ars: round2(r.ganancias),
      aportes_ars: round2(r.aportes), neto_ars: round2(r.neto),
      descuento_pct: round2(r.porcentajeDescuento),
    };
  });
  return {
    meta: {
      name: 'Impuesto a las Ganancias 2026 (empleados) — escala y deducciones art. 30',
      description:
        'Escala progresiva mensual del Impuesto a las Ganancias 2026 (9 tramos, 5% a 35%) y deducciones personales del art. 30 (GNI, deducción especial, cónyuge, hijos), primer semestre 2026.',
      datasetPage: `${HOMEPAGE}/datos-ganancias-2026`,
      source: 'ARCA — Ley 27.743 / RG 4003',
      sourceUrl: null,
      temporalCoverage: '2026-01/2026-06',
      lastReviewed: '2026-06-10',
      license: LICENSE,
      attribution: 'Hacé Cuentas — https://hacecuentas.com/datos-ganancias-2026',
      homepage: HOMEPAGE,
    },
    columns: ['desde_ars', 'hasta_ars', 'alicuota_marginal', 'monto_fijo_acumulado_ars'],
    data: escala,
    extra: { deducciones_art30: deducciones, ejemplos_bruto_a_neto: ejemplos },
    variableMeasured: [
      'Alícuota marginal por tramo', 'Monto fijo acumulado (ARS)',
      'Deducciones personales art. 30 (ARS)', 'Impuesto retenido por sueldo (ARS)',
    ],
  };
}

// ── Argentina · Topes SIPA 2026 ──────────────────────────────────────────────
export function buildTopesSipa(): DatosExport {
  const TOPE = BASE_IMPONIBLE_MAXIMA_APORTES;
  const aportes = [
    { concepto: 'Jubilación (SIPA)', tasa: 0.11 },
    { concepto: 'Obra social', tasa: 0.03 },
    { concepto: 'PAMI (INSSJP)', tasa: 0.03 },
  ];
  const data = aportes.map((a) => ({
    concepto: a.concepto, tasa: a.tasa, aporte_maximo_mensual_ars: round2(TOPE * a.tasa),
  }));
  const tasaTotal = aportes.reduce((s, a) => s + a.tasa, 0);
  const ejemplos = [2_000_000, 3_000_000, 4_000_000, TOPE, 5_000_000, 7_000_000, 12_000_000].map((bruto) => {
    const base = Math.min(bruto, TOPE);
    const ap = base * tasaTotal;
    return {
      bruto_mensual_ars: round2(bruto), base_imponible_ars: round2(base),
      aportes_ars: round2(ap), porcentaje_efectivo: round2((ap / bruto) * 100), topeado: bruto > TOPE,
    };
  });
  return {
    meta: {
      name: 'Base imponible máxima de aportes SIPA — Argentina, junio 2026',
      description:
        'Tope de la base imponible para aportes personales (jubilación 11%, obra social 3%, PAMI 3%) según Ley 24.241 art. 9: base máxima mensual, aporte máximo por concepto y ejemplos de aplicación en sueldos altos.',
      datasetPage: `${HOMEPAGE}/datos-topes-sipa-2026`,
      source: 'ANSES — Resolución 139/2026 (Ley 24.241)',
      sourceUrl: null,
      temporalCoverage: '2026-06',
      lastReviewed: '2026-06-10',
      license: LICENSE,
      attribution: 'Hacé Cuentas — https://hacecuentas.com/datos-topes-sipa-2026',
      homepage: HOMEPAGE,
    },
    columns: ['concepto', 'tasa', 'aporte_maximo_mensual_ars'],
    data,
    extra: {
      base_imponible_maxima_mensual_ars: round2(TOPE),
      base_imponible_maxima_sac_ars: round2(TOPE / 2),
      tasa_total_aportes: tasaTotal,
      ejemplos_por_bruto: ejemplos,
    },
    variableMeasured: [
      'Base imponible máxima mensual (ARS)', 'Tasa de aporte por concepto',
      'Aporte máximo mensual por concepto (ARS)',
    ],
  };
}

// ── Argentina · Aguinaldo (SAC) 2026 ─────────────────────────────────────────
export function buildAguinaldo(): DatosExport {
  const TOPE_SAC = BASE_IMPONIBLE_MAXIMA_APORTES / 2;
  const data = [600_000, 1_000_000, 1_500_000, 2_500_000, 4_414_652.38, 6_000_000, 10_000_000].map((s) => {
    const r = aguinaldo({ mejorSueldo: s, mesesTrabajados: 6 });
    return {
      mejor_sueldo_semestre_ars: round2(s), sac_bruto_ars: round2(r.aguinaldoBruto),
      descuentos_ars: round2(r.descuentos), sac_neto_ars: round2(r.aguinaldoNeto),
    };
  });
  const proporcional = [1, 2, 3, 4, 5, 6].map((m) => {
    const r = aguinaldo({ mejorSueldo: 1_500_000, mesesTrabajados: m });
    return { meses_trabajados: m, sac_bruto_ars: round2(r.aguinaldoBruto), sac_neto_ars: round2(r.aguinaldoNeto) };
  });
  return {
    meta: {
      name: 'Aguinaldo (SAC) Argentina 2026 — reglas, fechas y ejemplos',
      description:
        'Reglas del Sueldo Anual Complementario 2026: fechas legales de pago (30/6 y 18/12, Ley 27.073), fórmula del 50% de la mejor remuneración (art. 121 LCT), proporcional por meses trabajados, tope de aportes y ejemplos bruto → neto.',
      datasetPage: `${HOMEPAGE}/datos-aguinaldo-2026`,
      source: 'LCT (Ley 20.744) art. 121-123 / Ley 27.073',
      sourceUrl: null,
      temporalCoverage: '2026',
      lastReviewed: '2026-06-10',
      license: LICENSE,
      attribution: 'Hacé Cuentas — https://hacecuentas.com/datos-aguinaldo-2026',
      homepage: HOMEPAGE,
    },
    columns: ['mejor_sueldo_semestre_ars', 'sac_bruto_ars', 'descuentos_ars', 'sac_neto_ars'],
    data,
    extra: {
      fechas_pago_2026: { primera_cuota_limite: '2026-06-30', segunda_cuota_limite: '2026-12-18', tolerancia_dias_habiles: 4 },
      base_imponible_maxima_sac_ars: round2(TOPE_SAC),
      proporcional_mejor_sueldo_1500000: proporcional,
    },
    variableMeasured: [
      'SAC bruto por mejor sueldo (ARS)', 'Descuentos del SAC (ARS)',
      'SAC neto (ARS)', 'SAC proporcional por meses trabajados (ARS)',
    ],
  };
}

// ── LATAM · Salario mínimo 2026 ──────────────────────────────────────────────
export function buildSalarioMinimoLatam(): DatosExport {
  const ar = salarioMinimo({ horasSemana: 48 });
  const data = [
    { pais: 'Argentina', iso: 'AR', instrumento: 'Salario Mínimo, Vital y Móvil (SMVM)', valor_mensual: round2(ar.smvmMensual), moneda: 'ARS', norma: 'Resolución 9/2025 CNEPySMVyM', vigencia: ar.fechaVigencia },
    { pais: 'Brasil', iso: 'BR', instrumento: 'Salário mínimo nacional', valor_mensual: round2(SM_BR), moneda: 'BRL', norma: 'Decreto 12.797/2025', vigencia: '2026-01' },
    { pais: 'Perú', iso: 'PE', instrumento: 'Remuneración Mínima Vital (RMV)', valor_mensual: PERU_2026.rmv, moneda: 'PEN', norma: 'DS 006-2024-TR', vigencia: '2025-01 (mantenida 2026)' },
    { pais: 'Ecuador', iso: 'EC', instrumento: 'Salario Básico Unificado (SBU)', valor_mensual: ECUADOR_2026.sbu, moneda: 'USD', norma: 'Ministerio del Trabajo', vigencia: '2026-01' },
  ];
  return {
    meta: {
      name: 'Salario mínimo en América Latina 2026 — Argentina, Brasil, Perú y Ecuador',
      description:
        'Salario mínimo legal 2026 en moneda local, con instrumento legal, norma y vigencia por país: SMVM (Argentina), salário mínimo (Brasil), RMV (Perú) y SBU (Ecuador). Sólo países con fuente única verificada.',
      datasetPage: `${HOMEPAGE}/datos-salario-minimo-latam-2026`,
      source: 'Organismos oficiales por país (CNEPySMVyM, Receita Federal, SUNAT/MTPE, Min. Trabajo EC)',
      sourceUrl: null,
      temporalCoverage: '2026',
      lastReviewed: '2026-06-10',
      license: LICENSE,
      attribution: 'Hacé Cuentas — https://hacecuentas.com/datos-salario-minimo-latam-2026',
      homepage: HOMEPAGE,
    },
    columns: ['pais', 'iso', 'instrumento', 'valor_mensual', 'moneda', 'norma', 'vigencia'],
    data,
    variableMeasured: ['Salario mínimo mensual (moneda local)', 'Norma legal vigente', 'Fecha de vigencia'],
  };
}

/** Registro slug → builder. La clave es el slug de descarga (/datos/<slug>.json). */
export const EXPORTS: Record<string, () => DatosExport> = {
  'monotributo-2026': buildMonotributo,
  'ganancias-2026': buildGanancias,
  'topes-sipa-2026': buildTopesSipa,
  'aguinaldo-2026': buildAguinaldo,
  'salario-minimo-latam-2026': buildSalarioMinimoLatam,
};

/** Payload JSON: $meta + columnas + datos + extras. */
export function toJson(d: DatosExport): Record<string, unknown> {
  return {
    $meta: { ...d.meta, columns: d.columns, variableMeasured: d.variableMeasured },
    data: d.data,
    ...(d.extra ?? {}),
  };
}

/** Serializa la tabla principal a CSV (RFC 4180). */
export function toCsv(d: DatosExport): string {
  const esc = (v: Cell): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = d.columns.join(',');
  const rows = d.data.map((row) => d.columns.map((c) => esc(row[c] ?? null)).join(','));
  return [head, ...rows].join('\n') + '\n';
}
