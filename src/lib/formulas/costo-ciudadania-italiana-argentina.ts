/**
 * Costo y tiempo de la ciudadanía italiana desde Argentina.
 *
 * Estimador editable: el costo total depende de la VÍA elegida y de cuántas
 * partidas (actas) haya que rastrear, apostillar y traducir. Los precios unitarios
 * cambian seguido (traductor público, Registro Civil, tipo de cambio del euro),
 * por eso van como referenciales y editables.
 *
 *   Costo documentos = cantidad de actas × (pedido de partida + apostilla + traducción jurada)
 *   Vía consular     = costo documentos + tasas consulares/AIRE (el reconocimiento en sí no cobra arancel)
 *   Vía judicial     = costo documentos + honorarios de abogado en Italia (en EUR × tipo de cambio) + gastos
 *   Vía administrativa (residencia en Italia) = costo documentos + costos de residencia/estadía (no estimados acá)
 *
 * TIEMPO: la vía consular está dominada por la ESPERA DE TURNO (años); la judicial
 * evita esa espera pero implica un juicio en Italia (meses).
 */

export interface Inputs {
  via?: string;                 // 'consular' | 'judicial' | 'administrativa'
  cantidadActas: number;        // partidas a apostillar + traducir
  costoActa?: number;           // pedido/rastreo de cada partida (ARS)
  costoApostilla?: number;      // apostilla por documento (ARS)
  costoTraduccion?: number;     // traducción pública por documento (ARS)
  honorariosAbogadoEur?: number; // solo vía judicial (EUR)
  tipoCambioEuro?: number;      // ARS por EUR
}

export interface Outputs {
  costoTotal: string;
  costoDocumentos: string;
  costoVia: string;
  viaElegida: string;
  tiempoEstimado: string;
  costoPorActa: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

const VIAS: Record<string, { label: string; tiempo: string }> = {
  consular: { label: 'Consular (turno en el consulado en Argentina)', tiempo: '3 a 10+ años (dominado por la espera de turno)' },
  judicial: { label: 'Judicial (juicio en Italia)', tiempo: '18 a 24 meses aprox. (sin espera de turno)' },
  administrativa: { label: 'Administrativa (residencia en Italia)', tiempo: '6 a 12 meses de residencia + trámite en la comuna' },
};

export function compute(i: Inputs): Outputs {
  const via = String(i.via || 'consular');
  const viaInfo = VIAS[via] || VIAS.consular;
  const actas = Math.max(0, Number(i.cantidadActas) || 0);
  if (actas <= 0) throw new Error('Ingresá cuántas partidas (actas) tenés que apostillar y traducir.');

  // Defaults referenciales 2026 (ARS), editables.
  const costoActa = Number.isFinite(Number(i.costoActa)) ? Number(i.costoActa) : 15000;
  const costoApostilla = Number.isFinite(Number(i.costoApostilla)) ? Number(i.costoApostilla) : 12000;
  const costoTraduccion = Number.isFinite(Number(i.costoTraduccion)) ? Number(i.costoTraduccion) : 35000;
  const tcEuro = Number.isFinite(Number(i.tipoCambioEuro)) && Number(i.tipoCambioEuro) > 0 ? Number(i.tipoCambioEuro) : 1300;
  const honorariosEur = Number.isFinite(Number(i.honorariosAbogadoEur)) ? Number(i.honorariosAbogadoEur) : 0;

  const costoPorActa = costoActa + costoApostilla + costoTraduccion;
  const costoDocumentos = actas * costoPorActa;

  // Costo específico de la vía.
  let costoVia = 0;
  if (via === 'judicial') {
    // Honorarios del abogado en Italia (EUR → ARS). Default sugerido si no cargan monto.
    const eur = honorariosEur > 0 ? honorariosEur : 4000;
    costoVia = eur * tcEuro;
  }
  // Consular y administrativa: el reconocimiento en sí no cobra arancel; los
  // costos extra (AIRE, estadía) quedan fuera de la estimación base.

  const costoTotal = costoDocumentos + costoVia;

  const viaJudicial = via === 'judicial';
  const _insight = {
    title: `Costo estimado ${fmt(costoTotal)}`,
    text: viaJudicial
      ? `Por la **vía judicial** con **${actas} partidas**, los documentos cuestan **${fmt(costoDocumentos)}** y los honorarios del abogado en Italia rondan **${fmt(costoVia)}** (al cambio del euro que cargaste), total **${fmt(costoTotal)}**. Es más cara que la consular pero evita los años de espera de turno: se resuelve en unos **18 a 24 meses**.`
      : `Por la **vía ${via}** con **${actas} partidas**, el grueso del gasto son los documentos: **${fmt(costoDocumentos)}** (pedido de actas + apostillas + traducciones). El reconocimiento en el consulado no cobra arancel, pero el cuello de botella es la **espera de turno: ${viaInfo.tiempo.toLowerCase()}**. Todos los precios son referenciales: verificá el valor del traductor público y del Registro Civil.`,
    tone: 'neutral',
    icon: '🇮🇹',
  };

  const slices = [{ label: 'Documentos (actas + apostillas + traducciones)', value: Math.round(costoDocumentos) }];
  if (costoVia > 0) slices.push({ label: 'Honorarios de la vía', value: Math.round(costoVia) });
  const _chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: fmt(costoTotal),
    centerLabel: 'Costo total',
    ariaLabel: `Costo total estimado de ${fmt(costoTotal)}: ${fmt(costoDocumentos)} en documentos${costoVia > 0 ? ` y ${fmt(costoVia)} en honorarios de la vía` : ''}.`,
  };

  return {
    costoTotal: fmt(costoTotal),
    costoDocumentos: fmt(costoDocumentos),
    costoVia: fmt(costoVia),
    viaElegida: viaInfo.label,
    tiempoEstimado: viaInfo.tiempo,
    costoPorActa: fmt(costoPorActa),
    detalle: `Vía ${via}: ${actas} actas × ${fmt(costoPorActa)} = ${fmt(costoDocumentos)}${costoVia > 0 ? ` + honorarios ${fmt(costoVia)}` : ''} = ${fmt(costoTotal)}. Tiempo: ${viaInfo.tiempo}.`,
    _insight,
    _chart,
  };
}
