/**
 * Cooperativa de datos anónimos — catálogo de índices y fuentes.
 *
 * Idea: hoy el sitio NO envía los inputs del cálculo (privacidad por defecto, y
 * eso no se toca). Pero después de ciertos resultados ofrecemos una PARTICIPACIÓN
 * EXPLÍCITA: "¿querés aportar este dato de forma anónima para mejorar las
 * estadísticas argentinas?". Con consentimiento granular, sin guardar nada
 * automáticamente. A cambio, el usuario ve su percentil dentro de su segmento.
 *
 * El valor agregado: tras juntar datos, Hacé Cuentas deja de depender sólo de
 * información pública y construye índices propios (datos originales → backlinks,
 * notas, barrera de entrada).
 *
 * Arquitectura del módulo (TS puro, sin DOM):
 *   · COOP_DATASETS  — registro declarativo de los índices (label, unidad, copy,
 *                      estado live/soon). Lo consume la página de metodología, el
 *                      worker de agregación y el endpoint de stats.
 *   · COOP_SOURCES   — por slug de calc: cómo derivar el valor a aportar, qué
 *                      campos extra pedir en el consentimiento, y cómo segmentar.
 *
 * Lo importan TANTO el Worker SSR (endpoints /api/coop/*) COMO Calculator.astro
 * en build (para renderizar el bloque de aporte y sus campos). Sin imports de
 * runtime ni DOM.
 */

import { PROVINCES_BY_COUNTRY } from '../profile/schema';

export type CoopUnit = 'ARS' | 'pct';

/** Mínimo de observaciones para revelar un segmento (k-anonymity básico). */
export const MIN_OBS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de parsing/normalización (compartidos endpoint + build)
// ─────────────────────────────────────────────────────────────────────────────

/** Parsea un número desde number|string ("$20.833", "35%", "1.386.720"). null si no hay. */
export function coopNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim();
  // Sacar símbolos y separador de miles es-AR ("." entre grupos de 3), dejar coma decimal.
  const cleaned = s
    .replace(/[^\d.,-]/g, '')
    .replace(/\.(?=\d{3}\b)/g, '') // "1.386.720" → "1386720"
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** slug seguro para una pieza de segment_key: minúsculas, sin acentos, alnum+guion. */
export function coopSlugify(v: string): string {
  return String(v)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

/**
 * Clave canónica del segmento: `dataset|k1=v1|k2=v2` con claves ordenadas y
 * valores slugificados. Las dims vacías se omiten (segmento más grueso). Es
 * determinística → el mismo segmento siempre cae en la misma clave.
 */
export function coopSegmentKey(dataset: string, dims: Record<string, string>): string {
  const parts = Object.keys(dims)
    .sort()
    .map((k) => [k, coopSlugify(dims[k] || '')])
    .filter(([, v]) => v) // descartar dims sin valor
    .map(([k, v]) => `${k}=${v}`);
  return [dataset, ...parts].join('|');
}

/** Etiqueta legible de un segmento a partir de sus dims ("Desarrollo · Senior · CABA"). */
export function coopSegmentLabel(dims: Record<string, string>): string {
  const vals = Object.values(dims).filter((v) => v && v.trim());
  return vals.length ? vals.join(' · ') : 'todos los aportes';
}

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const fmtPct = (n: number) => `${Math.round(n * 10) / 10}%`;

/** Bucket ARS: paso adaptado a la magnitud, rango legible que sobrevive la poda. */
function bucketArs(v: number): string {
  const step = v >= 1_000_000 ? 250_000 : v >= 300_000 ? 100_000 : 25_000;
  const lo = Math.floor(v / step) * step;
  return `${fmtArs(lo)}–${fmtArs(lo + step)}`;
}

/** Bucket porcentaje: paso de 5 puntos. */
function bucketPct(v: number): string {
  const lo = Math.floor(v / 5) * 5;
  return `${lo}%–${lo + 5}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registro de índices (datasets)
// ─────────────────────────────────────────────────────────────────────────────

export interface CoopDataset {
  id: string;
  /** Nombre del índice público ("Índice Hacé Cuentas de sueldo neto"). */
  indexName: string;
  /** Etiqueta corta. */
  label: string;
  unit: CoopUnit;
  /** 'live' = ya tiene una calc cargando datos; 'soon' = planificado. */
  status: 'live' | 'soon';
  /** Descripción para la página de metodología/auditoría. */
  blurb: string;
  /** Mínimo de observaciones para revelar (default MIN_OBS). */
  minObs: number;
  /** Formatea un valor del dataset para mostrar ($ o %). */
  fmt: (v: number) => string;
  /** Bucketea a rango legible. */
  bucket: (v: number) => string;
  /**
   * Copy del feedback inmediato tras aportar. Recibe el percentil del usuario,
   * el n del segmento, la mediana, su valor y la etiqueta del segmento.
   */
  feedback: (p: { percentile: number; n: number; median: number; value: number; segmentLabel: string }) => string;
}

export const COOP_DATASETS: CoopDataset[] = [
  {
    id: 'sueldo-neto',
    indexName: 'Índice Hacé Cuentas de sueldo neto',
    label: 'Sueldo neto',
    unit: 'ARS',
    status: 'live',
    minObs: MIN_OBS,
    blurb:
      'Sueldo neto de bolsillo reportado de forma anónima, segmentado por rol, seniority y provincia. Permite ver tu posición relativa sin exponer tu número a nadie.',
    fmt: fmtArs,
    bucket: bucketArs,
    feedback: ({ percentile, n, median, segmentLabel }) =>
      `Tu sueldo neto está en el percentil ${percentile} entre ${n} personas de ${segmentLabel}. La mediana del segmento es ${fmtArs(median)}.`,
  },
  {
    id: 'alquiler-ingreso',
    indexName: 'Relación alquiler/ingreso por provincia',
    label: 'Alquiler / ingreso',
    unit: 'pct',
    status: 'live',
    minObs: MIN_OBS,
    blurb:
      'Qué porcentaje del ingreso del hogar se va en alquiler, por provincia y cantidad de ambientes. Un termómetro de esfuerzo habitacional construido con datos reales.',
    fmt: fmtPct,
    bucket: bucketPct,
    feedback: ({ value, median, n, segmentLabel }) =>
      `Tu alquiler representa el ${fmtPct(value)} de tu ingreso. La mediana para ${segmentLabel} es ${fmtPct(median)} (sobre ${n} hogares).`,
  },
  {
    id: 'tasa-plazo-fijo',
    indexName: 'Tasas de plazo fijo ofrecidas (publicadas vs reales)',
    label: 'TNA ofrecida',
    unit: 'pct',
    status: 'live',
    minObs: MIN_OBS,
    blurb:
      'La TNA que cada banco/billetera ofrece de verdad a sus clientes, que suele diferir de la publicada. Segmentada por entidad y plazo.',
    fmt: fmtPct,
    bucket: bucketPct,
    feedback: ({ value, percentile, n, median, segmentLabel }) =>
      `La TNA que te ofrecieron (${fmtPct(value)}) está en el percentil ${percentile} entre ${n} aportes de ${segmentLabel}. La mediana ofrecida es ${fmtPct(median)}.`,
  },

  // — Índices planificados (sin fuente cargando todavía). Se muestran en la
  //   metodología como roadmap; alcanza con agregar una entrada a COOP_SOURCES
  //   apuntando a la calc correspondiente para activarlos. —
  { id: 'costo-construccion-m2', indexName: 'Costo de construcción reportado ($/m²)', label: 'Construcción $/m²', unit: 'ARS', status: 'soon', minObs: MIN_OBS, blurb: 'Costo real por m² que reportan quienes están construyendo, por tipo de obra y provincia.', fmt: fmtArs, bucket: bucketArs, feedback: () => '' },
  { id: 'presupuesto-familiar', indexName: 'Presupuesto familiar argentino', label: 'Gasto familiar', unit: 'ARS', status: 'soon', minObs: MIN_OBS, blurb: 'Gasto mensual del hogar por composición familiar y provincia.', fmt: fmtArs, bucket: bucketArs, feedback: () => '' },
  { id: 'costo-auto', indexName: 'Costo real de tener un auto', label: 'Costo auto/mes', unit: 'ARS', status: 'soon', minObs: MIN_OBS, blurb: 'Gasto mensual total de mantener un auto (seguro, patente, combustible, service) por segmento.', fmt: fmtArs, bucket: bucketArs, feedback: () => '' },
  { id: 'honorarios-hora', indexName: 'Honorarios profesionales por hora', label: 'Tarifa/hora', unit: 'ARS', status: 'soon', minObs: MIN_OBS, blurb: 'Tarifa por hora que cobran profesionales independientes, por rubro y seniority.', fmt: fmtArs, bucket: bucketArs, feedback: () => '' },
  { id: 'costo-crianza', indexName: 'Costo de crianza', label: 'Crianza/mes', unit: 'ARS', status: 'soon', minObs: MIN_OBS, blurb: 'Gasto mensual por hijo según edad y tipo de educación.', fmt: fmtArs, bucket: bucketArs, feedback: () => '' },
  { id: 'seguro-auto', indexName: 'Cuotas de seguro de auto', label: 'Seguro auto/mes', unit: 'ARS', status: 'soon', minObs: MIN_OBS, blurb: 'Cuota mensual real de seguro por tipo de cobertura y zona.', fmt: fmtArs, bucket: bucketArs, feedback: () => '' },
];

const DATASET_BY_ID = new Map(COOP_DATASETS.map((d) => [d.id, d]));

export function getDataset(id: string): CoopDataset | null {
  return DATASET_BY_ID.get(id) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Campos de segmentación / valores extra que se piden en el consentimiento
// ─────────────────────────────────────────────────────────────────────────────

export interface CoopAskField {
  id: string;
  label: string;
  type: 'enum' | 'number';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  /** Sufijo visual (ej. '$', '%'). */
  unit?: string;
}

const opt = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

/** Provincias AR como opciones (reusa el vocabulario del perfil). */
const PROVINCIAS_AR: { value: string; label: string }[] = [
  { value: '', label: 'Prefiero no decir' },
  ...opt(PROVINCES_BY_COUNTRY.AR),
];

const ROLES: { value: string; label: string }[] = opt([
  'Desarrollo / IT', 'Diseño / UX', 'Marketing / Comunicación', 'Ventas / Comercial',
  'Administración / Finanzas', 'RR.HH. / Legal', 'Operaciones / Producción',
  'Logística / Depósito', 'Atención al cliente', 'Salud', 'Educación',
  'Oficios / Construcción', 'Gastronomía / Turismo', 'Profesional independiente', 'Otro',
]);

const SENIORITY: { value: string; label: string }[] = opt([
  'Junior', 'Semi-senior', 'Senior', 'Líder / Gerencia',
]);

const BANCOS: { value: string; label: string }[] = opt([
  'Nación', 'Provincia', 'Galicia', 'Santander', 'BBVA', 'Macro', 'Ciudad',
  'ICBC', 'Credicoop', 'Supervielle', 'Mercado Pago', 'Ualá', 'Naranja X',
  'Otra billetera / fintech', 'Otro banco',
]);

const AMBIENTES: { value: string; label: string }[] = opt([
  '1 ambiente', '2 ambientes', '3 ambientes', '4+ ambientes',
]);

/** Bucketea días de plazo fijo a un plazo legible para segmentar. */
function plazoBucket(dias: number | null): string {
  if (dias === null) return '30 días';
  if (dias <= 30) return '30 días';
  if (dias <= 60) return '60 días';
  if (dias <= 90) return '90 días';
  if (dias <= 180) return '180 días';
  return '+180 días';
}

// ─────────────────────────────────────────────────────────────────────────────
// Fuentes: por slug de calc, cómo derivar el aporte y segmentarlo
// ─────────────────────────────────────────────────────────────────────────────

export interface CoopDeriveCtx {
  result: Record<string, any>;
  inputs: Record<string, any>;
  extra: Record<string, string>;
}

export interface CoopSource {
  slug: string;
  dataset: string;
  /** Campos extra a pedir en el consentimiento (segmentación o valores). */
  ask: CoopAskField[];
  /** Pregunta/CTA específica que mostramos tras el resultado. */
  prompt: string;
  /** Sustantivo del segmento para algún copy genérico ("tu área y seniority"). */
  segmentNoun: string;
  /** Deriva el valor numérico a aportar. null = no se puede aportar. */
  derive: (ctx: CoopDeriveCtx) => number | null;
  /** Dims legibles del segmento desde inputs + extra. */
  dims: (ctx: Omit<CoopDeriveCtx, 'result'>) => Record<string, string>;
}

export const COOP_SOURCES: CoopSource[] = [
  // — Índice de sueldo neto —
  {
    slug: 'sueldo-en-mano-argentina',
    dataset: 'sueldo-neto',
    prompt: '¿Aportás tu sueldo neto de forma anónima para el índice de sueldos argentinos?',
    segmentNoun: 'tu área y seniority',
    ask: [
      { id: 'rol', label: 'Área / rol', type: 'enum', options: ROLES, required: true },
      { id: 'seniority', label: 'Seniority', type: 'enum', options: SENIORITY, required: true },
      { id: 'provincia', label: 'Provincia', type: 'enum', options: PROVINCIAS_AR },
    ],
    derive: ({ result }) => coopNum(result?.neto),
    dims: ({ extra }) => ({ provincia: extra.provincia || '', rol: extra.rol || '', seniority: extra.seniority || '' }),
  },
  {
    slug: 'simulador-recibo-de-sueldo-argentina',
    dataset: 'sueldo-neto',
    prompt: '¿Aportás tu sueldo neto de forma anónima para el índice de sueldos argentinos?',
    segmentNoun: 'tu área y seniority',
    ask: [
      { id: 'rol', label: 'Área / rol', type: 'enum', options: ROLES, required: true },
      { id: 'seniority', label: 'Seniority', type: 'enum', options: SENIORITY, required: true },
      { id: 'provincia', label: 'Provincia', type: 'enum', options: PROVINCIAS_AR },
    ],
    derive: ({ result }) => coopNum(result?.neto),
    dims: ({ extra }) => ({ provincia: extra.provincia || '', rol: extra.rol || '', seniority: extra.seniority || '' }),
  },

  // — Relación alquiler / ingreso —
  {
    slug: 'calculadora-actualizacion-alquiler-icl',
    dataset: 'alquiler-ingreso',
    prompt: '¿Aportás de forma anónima cuánto pesa tu alquiler en tu ingreso? Construimos un índice por provincia.',
    segmentNoun: 'hogares similares',
    ask: [
      { id: 'ingresoHogar', label: 'Ingreso neto del hogar (mensual)', type: 'number', required: true, unit: '$', placeholder: 'Ej. 1.200.000' },
      { id: 'provincia', label: 'Provincia', type: 'enum', options: PROVINCIAS_AR },
      { id: 'ambientes', label: 'Ambientes', type: 'enum', options: AMBIENTES },
    ],
    // value = alquiler / ingreso * 100 (porcentaje). Usa el alquiler vigente (input).
    derive: ({ inputs, extra }) => {
      const alquiler = coopNum(inputs?.valorActual);
      const ingreso = coopNum(extra?.ingresoHogar);
      if (alquiler === null || ingreso === null || ingreso <= 0 || alquiler <= 0) return null;
      const ratio = (alquiler / ingreso) * 100;
      if (ratio <= 0 || ratio > 100) return null; // descartar valores absurdos
      return Math.round(ratio * 10) / 10;
    },
    dims: ({ extra }) => ({ provincia: extra.provincia || '', ambientes: extra.ambientes || '' }),
  },

  // — Tasas de plazo fijo ofrecidas —
  {
    slug: 'calculadora-plazo-fijo',
    dataset: 'tasa-plazo-fijo',
    prompt: '¿Qué banco te ofreció esta tasa? Aportala anónima y comparamos la TNA real entre entidades.',
    segmentNoun: 'tu banco y plazo',
    ask: [
      { id: 'banco', label: 'Banco / billetera', type: 'enum', options: BANCOS, required: true },
    ],
    derive: ({ inputs }) => {
      const tna = coopNum(inputs?.tna);
      if (tna === null || tna <= 0 || tna > 500) return null;
      return tna;
    },
    dims: ({ inputs, extra }) => ({ banco: extra.banco || '', plazo: plazoBucket(coopNum(inputs?.dias)) }),
  },
];

const SOURCE_BY_SLUG = new Map(COOP_SOURCES.map((s) => [s.slug, s]));

export const COOP_ELIGIBLE_SLUGS: ReadonlySet<string> = new Set(SOURCE_BY_SLUG.keys());

export function isCoopEligible(slug: string): boolean {
  return SOURCE_BY_SLUG.has(slug);
}

export function getCoopSource(slug: string): CoopSource | null {
  return SOURCE_BY_SLUG.get(slug) || null;
}
