/**
 * Costos para constituir una compañía en Ecuador (SAS, Cía. Ltda. o S.A.) — 2026.
 * Compara la vía DIGITAL (en línea ante SUPERCIAS, sin notaría ni Registro Mercantil)
 * con la vía TRADICIONAL (documento privado o escritura + inscripción).
 *
 * Datos canónicos 2026:
 * - SAS: $0 en SUPERCIAS, capital desde $1, sin notaría ni Registro Mercantil, 100% en línea.
 *   Fuente: SUPERCIAS / Guía Oficial gob.ec — https://www.gob.ec/scvs/tramites/constitucion-sociedades-acciones-simplificadas
 * - Capital mínimo: SAS $1 · Cía. Ltda. $400 · S.A. $800.
 *   Fuente: Ley de Compañías / SUPERCIAS — https://www.supercias.gob.ec/
 * - RUC en el SRI: gratuito. Fuente: SRI — https://www.sri.gob.ec/ruc
 * - Firma electrónica (archivo .p12), persona natural, 1 año: ~$18 (uno por cada socio/accionista
 *   y por el representante legal en la constitución electrónica). Fuente: proveedores acreditados ARCOTEL
 *   (FirmaOK $18,05/año) — https://firmaok.com.ec/blog/cuanto-cuesta-firma-electronica-ecuador
 * - Reforma a la Ley de Compañías (Registro Oficial 15-mar-2023, vigente en 2026): Ltda. y S.A.
 *   pueden constituirse por documento privado, sin escritura pública obligatoria, e inscribirse
 *   en el Registro Mercantil. Fuente: Primicias —
 *   https://www.primicias.ec/noticias/economia/cambios-reforma-ley-companias-ecuador/
 */

// fuente: SUPERCIAS / gob.ec, 2026 — constitución en línea sin costo
const COSTO_SUPERCIAS = 0;
// fuente: SRI, 2026 — el RUC no tiene costo
const COSTO_RUC = 0;
// fuente: SUPERCIAS — reserva de denominación (nombre) en línea, sin costo
const COSTO_RESERVA_NOMBRE = 0;

// fuente: FirmaOK 2026, archivo .p12 persona natural, 1 año (~$18). Una por firmante.
const FIRMA_ELECTRONICA = 18;

// Capital mínimo legal por tipo de compañía (USD). Fuente: Ley de Compañías / SUPERCIAS 2026.
const CAPITAL_MINIMO: Record<string, number> = {
  sas: 1,    // SAS: desde $1
  ltda: 400, // Compañía de Responsabilidad Limitada
  sa: 800,   // Sociedad Anónima
};

// Costos de la vía TRADICIONAL para Ltda./S.A. (rangos de mercado 2026, USD).
// Fuente: Russell Bedford EC 2026 (notaría $1.000–1.500 para S.A. con capital $800);
// https://russellbedford.com.ec/como-constituir-una-empresa-en-ecuador-2026/
// Tomamos puntos medios conservadores; honorarios legales aparte.
const NOTARIA_LTDA = 200;       // escritura/documento privado notariado (Ltda.)
const NOTARIA_SA = 350;         // escritura/documento privado notariado (S.A., mayor capital)
const REGISTRO_MERCANTIL = 90;  // inscripción en el Registro Mercantil (varía por cantón/capital)
const PUBLICACION_EXTRACTO = 0; // extracto: en general ya no se publica en prensa pagada en 2026

function fmtUSD(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

export interface Inputs {
  tipoCompania: 'sas' | 'ltda' | 'sa'; // tipo de compañía a constituir
  via: 'digital' | 'tradicional';      // vía de constitución
  capital?: number;                    // capital suscrito (USD), opcional → usa el mínimo legal
  numSocios?: number;                  // número de socios/accionistas
  honorariosLegales?: number;          // honorarios de abogado opcionales (USD)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const tipo = (i.tipoCompania || '').toString().toLowerCase();
  if (!['sas', 'ltda', 'sa'].includes(tipo)) {
    throw new Error('Elegí el tipo de compañía: SAS, Cía. Ltda. o S.A.');
  }
  const via = (i.via || '').toString().toLowerCase();
  if (!['digital', 'tradicional'].includes(via)) {
    throw new Error('Elegí la vía de constitución: digital o tradicional.');
  }

  const numSocios = Math.max(1, Math.floor(Number(i.numSocios) || 1));
  const capitalMin = CAPITAL_MINIMO[tipo];

  // Capital: si no se ingresa o es menor al mínimo, usar el mínimo legal del tipo.
  const capitalIngresado = Number(i.capital);
  const capital = Number.isFinite(capitalIngresado) && capitalIngresado > 0
    ? Math.max(capitalIngresado, capitalMin)
    : capitalMin;

  const honorarios = Math.max(0, Number(i.honorariosLegales) || 0);

  // La SAS solo se constituye en línea ante SUPERCIAS (no hay notaría ni Registro Mercantil).
  const viaEfectiva = tipo === 'sas' ? 'digital' : via;

  // Firma electrónica: requerida en la vía digital para cada firmante
  // (socios/accionistas + 1 representante legal si no es socio). Estimamos una por socio.
  const numFirmas = viaEfectiva === 'digital' ? numSocios : 0;
  const costoFirmas = numFirmas * FIRMA_ELECTRONICA;

  // Rubros por vía
  let notaria = 0;
  let registroMercantil = 0;
  let publicacion = 0;

  if (viaEfectiva === 'tradicional') {
    notaria = tipo === 'sa' ? NOTARIA_SA : NOTARIA_LTDA;
    registroMercantil = REGISTRO_MERCANTIL;
    publicacion = PUBLICACION_EXTRACTO;
  }

  const supercias = COSTO_SUPERCIAS;
  const ruc = COSTO_RUC;
  const reservaNombre = COSTO_RESERVA_NOMBRE;

  // Total de trámites (sin contar el capital, que es tuyo, no un gasto perdido)
  const totalTramites =
    supercias + ruc + reservaNombre + costoFirmas + notaria + registroMercantil + publicacion + honorarios;

  // Desembolso inicial total incluyendo el capital a depositar
  const desembolsoTotal = totalTramites + capital;

  // Comparación: ¿cuánto costaría por la otra vía? (solo si NO es SAS, que es siempre digital)
  let ahorroVsTradicional = 0;
  let costoTradicionalRef = 0;
  if (tipo !== 'sas') {
    const notTrad = tipo === 'sa' ? NOTARIA_SA : NOTARIA_LTDA;
    costoTradicionalRef = supercias + ruc + reservaNombre + notTrad + REGISTRO_MERCANTIL + PUBLICACION_EXTRACTO + honorarios;
    const costoDigitalRef = supercias + ruc + reservaNombre + numSocios * FIRMA_ELECTRONICA + honorarios;
    ahorroVsTradicional = costoTradicionalRef - costoDigitalRef;
  }

  // Tiempo estimado
  const tiempoDias = viaEfectiva === 'digital'
    ? (tipo === 'sas' ? '1 a 3 días hábiles' : '2 a 5 días hábiles')
    : '1 a 3 semanas';

  const tipoLabel = tipo === 'sas' ? 'SAS' : tipo === 'ltda' ? 'Cía. Ltda.' : 'S.A.';
  const viaLabel = viaEfectiva === 'digital' ? 'digital (en línea ante SUPERCIAS)' : 'tradicional (notaría + Registro Mercantil)';

  // Insight
  let insightText: string;
  let tone = 'positive';
  if (tipo === 'sas') {
    insightText = `Constituir una **SAS** cuesta **$0 en SUPERCIAS**: sin notaría ni Registro Mercantil. Tu único gasto real son **${fmtUSD(costoFirmas)}** en firmas electrónicas (${numSocios} ${numSocios === 1 ? 'firma' : 'firmas'})${honorarios > 0 ? ` y ${fmtUSD(honorarios)} de honorarios legales` : ''}. El capital de **${fmtUSD(capital)}** queda en tu cuenta: es tuyo, no un gasto. Total de trámites: **${fmtUSD(totalTramites)}**.`;
  } else if (viaEfectiva === 'digital') {
    insightText = `Por la vía digital, una **${tipoLabel}** te ahorra unos **${fmtUSD(ahorroVsTradicional)}** frente a la notaría tradicional. Trámites: **${fmtUSD(totalTramites)}**. Igual debés integrar el capital mínimo de **${fmtUSD(capitalMin)}**. Si lo que buscás es el menor costo y trámite, evaluá una **SAS** ($0 en SUPERCIAS, capital desde $1).`;
    tone = 'positive';
  } else {
    insightText = `La vía **tradicional** de una **${tipoLabel}** suma **${fmtUSD(notaria + registroMercantil)}** en notaría y Registro Mercantil. Trámites totales: **${fmtUSD(totalTramites)}**. Por la **vía digital** (documento privado en línea) te ahorrarías unos **${fmtUSD(ahorroVsTradicional)}**, y una **SAS** lo haría por $0 en SUPERCIAS.`;
    tone = 'neutral';
  }

  const _insight = {
    title: `Constituir una ${tipoLabel} en Ecuador`,
    text: insightText,
    tone,
    icon: '📝',
  };

  // Chart: desglose de los rubros de trámite (sin el capital)
  const segments = [
    { label: 'SUPERCIAS', value: Math.round(supercias * 100) / 100 },
    { label: 'Firmas electrónicas', value: Math.round(costoFirmas * 100) / 100 },
    { label: 'Notaría', value: Math.round(notaria * 100) / 100 },
    { label: 'Registro Mercantil', value: Math.round(registroMercantil * 100) / 100 },
    { label: 'RUC', value: Math.round(ruc * 100) / 100 },
  ];
  if (honorarios > 0) segments.push({ label: 'Honorarios legales', value: Math.round(honorarios * 100) / 100 });

  const _chart = {
    type: 'donut',
    segments: segments.filter((s) => s.value > 0).length > 0 ? segments : [{ label: 'Trámites', value: Math.max(totalTramites, 0.0) }],
    ariaLabel: `Desglose de costos de constitución: total de trámites ${fmtUSD(totalTramites)}.`,
  };

  const detalle =
    `${tipoLabel} · vía ${viaEfectiva}. ` +
    `SUPERCIAS ${fmtUSD(supercias)} · RUC ${fmtUSD(ruc)} · Reserva de nombre ${fmtUSD(reservaNombre)} · ` +
    `Firmas electrónicas (${numFirmas}) ${fmtUSD(costoFirmas)} · Notaría ${fmtUSD(notaria)} · ` +
    `Registro Mercantil ${fmtUSD(registroMercantil)}` +
    (honorarios > 0 ? ` · Honorarios ${fmtUSD(honorarios)}` : '') +
    `. Capital a integrar ${fmtUSD(capital)} (mínimo legal ${fmtUSD(capitalMin)}).`;

  return {
    totalTramites: fmtUSD(totalTramites),
    desembolsoTotal: fmtUSD(desembolsoTotal),
    costoFirmas: fmtUSD(costoFirmas),
    costoNotaria: fmtUSD(notaria),
    costoRegistroMercantil: fmtUSD(registroMercantil),
    capitalRequerido: fmtUSD(capital),
    capitalMinimoLegal: fmtUSD(capitalMin),
    ahorroVsTradicional: tipo === 'sas' ? '—' : fmtUSD(ahorroVsTradicional),
    tiempoEstimado: tiempoDias,
    detalle,
    _insight,
    _chart,
  };
}
