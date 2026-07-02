/**
 * "Salas de decisión" (/decidir/*) — orquestador de varias fórmulas con un
 * mismo estado y un resultado integrado.
 *
 * A diferencia de una calc (una fórmula, una respuesta numérica), una sala toma
 * varias variables de una decisión real ("¿me conviene aceptar esta oferta?"),
 * corre internamente VARIAS fórmulas existentes (sueldo neto, ganancias, costos
 * de traslado, valor hora, punto de indiferencia) y devuelve una CONCLUSIÓN
 * accionable, no sólo un número.
 *
 * SEO: las salas son una TERCERA clase de intención (decisional/comparativa),
 * distinta de las calcs (transaccional) y las guías (informacional). Por eso
 * viven en su propio namespace `/decidir/<slug>` y nunca llevan como título
 * primario "calculadora de X" — eso evita canibalizar las calcs. Cada sala
 * enlaza a sus calcs componentes para pasarles autoridad interna.
 *
 * Este módulo es TS puro (sin DOM): el tipo de campo es estructuralmente
 * compatible con el `Field` de Calculator.astro pero NO lo importa, para que el
 * registro de salas se pueda consumir tanto en el cliente (compute) como en
 * scripts de build (sitemap) sin arrastrar un componente .astro.
 */

/** Campo del formulario de una sala. Superset compatible con FieldRow `Field`. */
export interface DecisionField {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'date';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: string | number;
  options?: { value: string; label: string }[];
  required?: boolean;
  recommended?: boolean;
  help?: string;
  format?: 'thousands' | 'plain';
  advanced?: boolean;
  /** Agrupador visual (Smart Input Groups de FieldRow). */
  group?: string;
  groupIcon?: string;
  /** Clave canónica del perfil "Mi Hacé Cuentas" (precarga + writeback). */
  profileKey?: string;
}

/** Tono del veredicto — gobierna el color del bloque de conclusión. */
export type DecisionTone = 'good' | 'warn' | 'bad' | 'neutral';

/** Resultado integrado de una sala. Lo produce `room.compute(inputs)`. */
export interface DecisionResult {
  /**
   * Estado de la decisión:
   *   'a'             → conviene la opción A (en oferta laboral: quedarte)
   *   'b'             → conviene la opción B (aceptar la oferta)
   *   'tie'           → diferencia marginal / está al límite
   *   'insufficient'  → faltan datos para concluir
   */
  status: 'a' | 'b' | 'tie' | 'insufficient';
  /** Bloque 1 — conclusión directa en una frase. `badge` = etiqueta corta del
   *  estado (cada sala define la suya; si falta, el componente usa un default). */
  verdict: { title: string; detail: string; tone: DecisionTone; badge?: string };
  /** Bloque 2 — el número que decide. */
  decisiveNumber: { value: string; label: string; sub?: string };
  /** Bloque 3 — tres escenarios (conservador / probable / favorable). */
  scenarios: Array<{ label: string; value: string; detail: string }>;
  /** Bloque 4 — próximos pasos concretos (admite **negrita** inline). */
  nextActions: string[];
  /**
   * Desglose comparativo A vs B (cómo se llegó al número). Si la sala compara
   * dos opciones (oferta laboral, alquilar vs comprar) usa `comparison`; si es
   * un cálculo de una sola columna (deuda) usa `breakdown`.
   */
  comparison?: {
    columns: [string, string];
    rows: Array<{ label: string; a: string; b: string; hint?: string }>;
  };
  breakdown?: Array<{ label: string; value: string; hint?: string }>;
  /** Aclaraciones / supuestos del cálculo (caveats honestos). */
  notes?: string[];
}

/** Una sala de decisión completa. */
export interface DecisionRoom {
  slug: string;
  /** <title> SEO (fraseo de decisión, NUNCA "calculadora de X"). */
  title: string;
  /** H1 visible — la pregunta de la decisión. */
  h1: string;
  /** Meta description. */
  description: string;
  /** Párrafo de intro (qué resuelve la sala y cómo). */
  intro: string;
  icon: string;
  /** Categoría para breadcrumb / theming (reusa la taxonomía de calcs). */
  category: string;
  /** País de la sala. Las salas raíz (/decidir/*) son 'AR'; las localizadas
   *  viven en subdirectorios co/mx/cl/pe y se sirven bajo /<cc>/decidir/*. */
  audience: 'AR' | 'CO' | 'MX' | 'CL' | 'PE';
  /** YYYY-MM-DD — alimenta el lastmod del sitemap y el sello "revisado". */
  lastReviewed: string;
  /** Campos del formulario. */
  fields: DecisionField[];
  /** Inputs de ejemplo para el baseline SSR (lo que el bot ve sin ejecutar JS). */
  example: Record<string, number | string>;
  /** Orquestador: corre las fórmulas y devuelve el resultado integrado. */
  compute: (inputs: Record<string, any>) => DecisionResult;
  /** Calcs componentes que enlaza la sala (autoridad interna, anti-canibalización). */
  componentCalcs: Array<{ slug: string; label: string }>;
  /** Cómo funciona (markdown). */
  howItWorks: string;
  /** FAQ (mínimo 7 — regla anti thin-content). */
  faq: Array<{ q: string; a: string }>;
  /** Fuentes citables (E-E-A-T). */
  sources?: Array<{ name: string; url?: string }>;
}

// — Helpers compartidos por los orquestadores —

/** Formatea pesos AR: 1234567 → "$1.234.567" (negativos: "-$..."). */
export function fmtMoney(n: number): string {
  const r = Math.round(n);
  const sign = r < 0 ? '-' : '';
  return `${sign}$${Math.abs(r).toLocaleString('es-AR')}`;
}

/** Formatea porcentaje con signo: 8.42 → "+8,4%". */
export function fmtPct(n: number, decimals = 1): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals).replace('.', ',')}%`;
}

/** Coerción robusta a número (tolera string con separadores ya limpiados). */
export function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Bool desde varios encodings (select 'si'/'no', boolean, 1/0). */
export function bool(v: unknown): boolean {
  return v === true || v === 'true' || v === 'si' || v === 'sí' || v === 1 || v === '1';
}
