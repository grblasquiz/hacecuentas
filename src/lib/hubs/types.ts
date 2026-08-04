/**
 * Contrato de datos de un hub de decisión.
 *
 * Un hub = UNA pregunta que una persona real se hace, con las calculadoras
 * necesarias para responderla adentro. Reemplaza N URLs de calculadora suelta.
 *
 * El componente `DecisionHub.astro` renderiza todo el chrome (hero, paneles,
 * gráfico, FAQ, fuentes) a partir de este objeto. Lo ÚNICO que cada hub aporta
 * aparte de estos datos es su función `compute()`, que vive en el <script> de
 * su propia página y llama a `window.HC_HUB.render(...)`.
 *
 * Regla para no romper el sistema: un hub NUNCA edita este archivo ni
 * DecisionHub.astro. Si algo no entra en el contrato, se avisa y se extiende
 * el contrato una sola vez para todos.
 */

/** Campo de entrada. El id es la clave que recibe compute(). */
export interface HubField {
  id: string;
  label: string;
  type?: 'number' | 'text' | 'select' | 'date';
  /**
   * Valor de ejemplo precargado en el campo. OJO: el panel de resultado arranca
   * en $0 a propósito — el usuario tiene que apretar "Actualizar estimación"
   * para verlo. Es una decisión de producto, no un bug: fuerza el contacto con
   * el formulario. No "arreglar".
   */
  value: string | number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  /** Formatea con separador de miles mientras se tipea. */
  thousands?: boolean;
  help?: string;
}

/**
 * Rama del arquetipo "ramificado". Omitir `cases` en los demás arquetipos.
 *
 * El desplegable "Mi caso es otro" arranca ABIERTO a propósito: muestra de
 * entrada que el hub cubre todas las situaciones, y deja el texto de cada rama
 * visible en el HTML para los buscadores. No cerrarlo.
 */
export interface HubCase {
  id: string;
  label: string;
  hint: string;
  /** Qué entra en el cálculo en ESTE caso. */
  yes: string[];
  /** Advertencias propias de este caso. */
  warn: string[];
  /** Plazo o dato accionable de este caso. */
  plazo: string;
  /** Frase de respuesta rápida (la que puede ganar el snippet). */
  answer: string;
}

/**
 * Gráfico del hub. Elegir el que responde LA pregunta, no el más vistoso.
 *  - donut     composición de un total en 3-5 partes
 *  - bars      ranking o comparación de rubros con su valor
 *  - stacked   una sola barra partida (bolsillo vs descuentos)
 *  - scale     dónde caés vos en un rango con franjas (IMC, percentiles)
 *  - timeline  dónde estás en una secuencia (semanas de embarazo, tramos)
 *  - progress  cuánto llevás contra un objetivo
 *  - steps     escalones discretos (tramos de Ganancias, días de vacaciones)
 */
export type HubChartType = 'donut' | 'bars' | 'stacked' | 'scale' | 'timeline' | 'progress' | 'steps';

export interface HubChart {
  type: HubChartType;
  /** Título corto sobre el gráfico. */
  title?: string;
  /** Explica qué está leyendo el usuario. Obligatorio: un gráfico sin lectura no aporta. */
  caption: string;
  /** Series fijas del gráfico (las que no dependen del cálculo). */
  bands?: Array<{ label: string; from: number; to: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }>;
}

export interface HubFaq {
  q: string;
  a: string;
}

export interface HubSource {
  name: string;
  url: string;
  publisher?: string;
  date?: string;
}

export interface HubData {
  /** Ruta sin barra inicial: 'trabajo/indemnizacion-por-despido'. */
  slug: string;
  /** <title> SEO. */
  title: string;
  /** Meta description. */
  description: string;
  /** Etiqueta del silo, para breadcrumb: 'Trabajo'. */
  silo: string;
  siloHref: string;

  eyebrow: string;
  /**
   * Pregunta rectora del hub, en la voz del usuario. Es obligatoria porque el
   * componente la presenta en grande bajo la leyenda "Este hub responde".
   * Todo hub nuevo hereda esa estructura automáticamente.
   */
  h1: string;
  lede: string;
  /** Sellos bajo el lede: fecha, norma aplicada, cantidad de calcs. */
  stamps: string[];

  /** Texto del panel de resultado. */
  resultLabel: string;

  /** Solo arquetipo ramificado. El primero es el caso por defecto. */
  cases?: {
    title: string;
    intro: string;
    items: HubCase[];
  };

  inputsTitle: string;
  inputsIntro: string;
  fields: HubField[];
  /** Aclaración bajo el botón. */
  fineprint: string;

  chart: HubChart;
  breakdownTitle: string;
  breakdownIntro: string;

  /** Qué corresponde / qué mirar, cuando el hub NO es ramificado. */
  answer?: { title: string; copy: string; yes: string[]; warn: string[]; plazo: string };

  /** Mínimo 7 — regla anti thin-content del proyecto. */
  faq: HubFaq[];
  sources: HubSource[];

  /** URLs viejas que este hub reemplaza (alimentan los 301). */
  replaces: string[];

  /**
   * Notas del blog que profundizan este hub. OPCIONAL y deliberadamente escaso:
   * el blog es mucho más débil que los hubs (656 sesiones orgánicas en 19 meses
   * contra ~310 por día de los hubs), así que linkear hacia allá reparte
   * autoridad hacia abajo. Se usa sólo cuando el post aporta algo que el hub no
   * puede dar —una tabla, una guía larga, un informe— y sólo hacia posts que ya
   * rinden solos en orgánico. Si dudás, no lo pongas.
   *
   * El href va completo ('/blog/<slug>'). Máximo 2 por hub.
   */
  relatedPosts?: Array<{ href: string; title: string; note: string }>;

  lastReviewed: string;
  audience?: 'AR' | 'global';

  /**
   * Mercado del hub, cuando no es Argentina. Los hubs de país viven bajo su
   * propio prefijo (`slug: 'co/impuestos/renta'` → /co/impuestos/renta), que es
   * donde ya vivían sus calculadoras y donde el hreflang tiene sentido. Sin
   * este campo el hub es AR/global y va en la raíz (`slug: 'trabajo/…'`).
   *
   * El `siloHref` de un hub de país incluye el prefijo: '/co/impuestos'.
   */
  locale?: 'cl' | 'co' | 'do' | 'ec' | 'en' | 'es' | 'mx' | 'pe' | 'pt' | 'pt-pt' | 'py' | 'uy' | 've';
}

/**
 * Cómo formatear un número del resultado.
 *  - 'ars'   $1.792            (default: la mayoría de los hubs son plata)
 *  - 'plain' 1.792             (cantidades sin unidad)
 *  - 'unit'  1.792 semanas     (usa `unit`)
 */
export type HubFormat = 'ars' | 'plain' | 'unit';

/** Fila del desglose que devuelve compute(). */
export interface HubRow {
  /** Concepto. */
  k: string;
  /** Referencia corta: artículo de ley o fuente. NO la unidad — para eso está `unit`. */
  ref?: string;
  /** Valor numérico crudo (el runtime lo formatea). */
  v: number;
  /** Marca la fila como destacada aunque no sea la mayor. */
  extra?: boolean;
  /** Pisa el formato del hub para esta fila. */
  format?: HubFormat;
  /** Unidad a mostrar cuando el formato es 'unit' ("semanas", "kg", "días"). */
  unit?: string;
  /** Decimales. Default 0. */
  decimals?: number;
}

/** Lo que compute() le pasa a window.HC_HUB.render(). */
export interface HubResult {
  /** Valor principal ya formateado. */
  total: string;
  /** Línea de contexto bajo el total. */
  sub: string;
  rows: HubRow[];
  /** Segmentos del gráfico: label + valor + color semántico. */
  chart: Array<{
    label: string;
    value: number;
    tone?: 'main' | 'exit' | 'prop' | 'good' | 'warn' | 'bad';
    /** Para 'scale'/'timeline'/'steps': dónde empieza y termina la franja. */
    from?: number;
    to?: number;
  }>;
  /** Formato de los números de este resultado. Default 'ars'. */
  format?: HubFormat;
  /** Unidad cuando format es 'unit'. */
  unit?: string;
  /** Decimales de los valores. Default 0. */
  decimals?: number;
  /** Posición 0-100 para scale / timeline / progress. */
  position?: number;
  /** Etiqueta de la posición ("Semana 24", "IMC 23,1 — normal"). */
  positionLabel?: string;
}
