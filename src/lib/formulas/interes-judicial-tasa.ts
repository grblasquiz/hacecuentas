/**
 * Estimador de interés judicial con tasa anual informada por el usuario.
 * Interés simple: Capital × (tasa/365) × días
 */

export interface InteresJudicialInputs {
  capital: number;
  tasaAnual?: number;
  tasaPreset?: string;
  jurisdiccion?: string;
  fechaDesde: string;
  fechaHasta?: string;
}

export interface InteresJudicialOutputs {
  totalConIntereses: number;
  interesesGenerados: number;
  diasTranscurridos: number;
  porcentajeTotal: string;
  tasaAplicada: string;
  _chart?: any;
  _insight?: any;
}

const TASAS_PRESET: Record<string, { tasa: number; label: string }> = {
  activa_bna_33: { tasa: 33, label: 'tasa activa BNA de referencia 2026 (33% TNA)' },
  activa_bna_38: { tasa: 38, label: 'tasa activa BNA enero 2026 (38% TNA)' },
  resarcitoria_arca_72: { tasa: 72, label: 'tasa resarcitoria ARCA de referencia (72% TNA)' },
  pasiva_referencia_30: { tasa: 30, label: 'tasa pasiva de referencia (30% TNA)' },
};

// Doctrina vigente por jurisdicción. La tasa numérica es la de REFERENCIA 2026
// de esta calculadora (activa BNA 33% / pasiva 30%): cada banco publica la suya
// y varía mes a mes, así que el selector PREselecciona la tasa que ordena la
// doctrina del fuero, no reemplaza la liquidación oficial del juzgado.
const JURISDICCIONES: Record<string, { tasa: number; label: string; doctrina: string }> = {
  nacion: {
    tasa: 33,
    label: 'tasa activa BNA (referencia 2026: 33% TNA)',
    doctrina:
      'Fueros nacionales (civil/comercial/laboral): **tasa activa BNA** según plenario CNCiv **"Samudio de Martínez"** (20/04/2009). En laboral, la CSJN en **"Oliva c/ Coma"** (29/02/2024) invalidó la capitalización periódica del Acta CNAT 2764, por eso acá se aplica interés simple.',
  },
  pba: {
    tasa: 33,
    label: 'tasa activa (referencia 2026: 33% TNA, aprox. de la activa Banco Provincia)',
    doctrina:
      'Provincia de Buenos Aires: la SCBA en **"Barrios c/ Lascano"** (C 124.096, 17/04/2024) cambió la doctrina de la pasiva BIP ("Cabrera", 2017) por un esquema en dos tramos: interés puro del 6% anual sobre capital actualizado hasta la sentencia y **tasa activa del Banco Provincia** (operaciones de descuento) desde la sentencia hasta el pago. Esta calculadora aplica una única tasa activa de referencia como aproximación.',
  },
  caba: {
    tasa: 31.5,
    label: 'promedio activa BNA + pasiva BCRA (referencia 2026: 31,5% TNA)',
    doctrina:
      'CABA (fuero Contencioso Administrativo y Tributario): plenario **"Eiben c/ GCBA"** (31/05/2013) ordena el **promedio entre la tasa activa cartera general BNA a 30 días y la pasiva promedio del BCRA** (com. 14.290), desde la mora hasta el pago. Acá se usa el promedio de las tasas de referencia de esta calculadora.',
  },
};

export function interesJudicialTasa(inputs: InteresJudicialInputs): InteresJudicialOutputs {
  const capital = Number(inputs.capital);
  const juris = JURISDICCIONES[String(inputs.jurisdiccion || '')];
  const preset = juris ? undefined : TASAS_PRESET[String(inputs.tasaPreset || '')];
  const tasaManual = Number(inputs.tasaAnual);
  // La jurisdicción no determina por sí sola la tasa de un expediente. Una
  // tasa manual informada expresamente siempre tiene prioridad.
  const tasaAnual = tasaManual > 0 ? tasaManual : juris ? juris.tasa : preset ? preset.tasa : tasaManual;
  const partsD = String(inputs.fechaDesde || '').split('-').map(Number);
  if (partsD.length !== 3 || partsD.some(isNaN)) throw new Error('Ingresá una fecha desde válida');
  const [yD, mD, dD] = partsD;
  const fechaDesde = new Date(yD, mD - 1, dD);

  let fechaHasta: Date;
  if (inputs.fechaHasta) {
    const partsH = String(inputs.fechaHasta).split('-').map(Number);
    if (partsH.length !== 3 || partsH.some(isNaN)) throw new Error('Ingresá una fecha hasta válida');
    const [yH, mH, dH] = partsH;
    fechaHasta = new Date(yH, mH - 1, dH);
  } else {
    fechaHasta = new Date();
    fechaHasta.setHours(0, 0, 0, 0);
  }

  if (!capital || capital <= 0) throw new Error('Ingresá el capital de la deuda');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá la tasa anual');
  if (isNaN(fechaDesde.getTime())) throw new Error('Ingresá una fecha desde válida');
  if (fechaDesde > fechaHasta) throw new Error('La fecha desde no puede ser posterior a la fecha hasta');

  const diffMs = fechaHasta.getTime() - fechaDesde.getTime();
  const diasTranscurridos = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Interés simple: Capital × (tasa/365) × días
  const tasaDiaria = tasaAnual / 100 / 365;
  const interesesGenerados = capital * tasaDiaria * diasTranscurridos;
  const totalConIntereses = capital + interesesGenerados;
  const porcentajeTotal = ((interesesGenerados / capital) * 100).toFixed(1);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(capital) },
      { label: 'Intereses', value: Math.round(interesesGenerados) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalConIntereses).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición de la deuda: capital más intereses judiciales.',
  };

  const pctNum = (interesesGenerados / capital) * 100;
  const anios = (diasTranscurridos / 365);
  let insightTone: 'good' | 'warn' | 'neutral';
  if (pctNum >= 100) insightTone = 'warn';
  else if (pctNum >= 30) insightTone = 'neutral';
  else insightTone = 'good';
  const fuenteTasa = tasaManual > 0
    ? 'Usé la tasa manual informada. Confirmá que coincida con la resolución, sentencia o pauta aplicable a tu expediente.'
    : juris
    ? `Usé la **${juris.label}** únicamente como escenario orientativo. ${juris.doctrina} ⚠️ La jurisdicción no determina por sí sola la tasa: **verificá la resolución de tu expediente** antes de liquidar.`
    : preset
      ? `Usé la **${preset.label}**.`
      : 'Usé la tasa manual que ingresaste.';

  const insight = {
    title: 'Cuánto pesan los intereses',
    text: `Sobre un capital de **$${Math.round(capital).toLocaleString('es-AR')}**, en **${diasTranscurridos.toLocaleString('es-AR')} días** (${anios.toFixed(1)} años) se estiman **$${Math.round(interesesGenerados).toLocaleString('es-AR')}** de intereses, un **${porcentajeTotal}%** del capital. ${fuenteTasa} El capital más este interés simple da **$${Math.round(totalConIntereses).toLocaleString('es-AR')}**; no es una liquidación judicial.`,
    tone: insightTone,
    icon: '⚖️',
  };

  const tasaAplicada = tasaManual > 0
    ? `${String(tasaAnual).replace('.', ',')}% TNA — tasa manual informada`
    : juris
    ? `${String(tasaAnual).replace('.', ',')}% TNA — ${juris.label}`
    : preset
      ? `${String(tasaAnual).replace('.', ',')}% TNA — ${preset.label}`
      : `${String(tasaAnual).replace('.', ',')}% TNA — tasa manual`;

  return {
    totalConIntereses: Math.round(totalConIntereses),
    interesesGenerados: Math.round(interesesGenerados),
    diasTranscurridos,
    porcentajeTotal: `${porcentajeTotal}% sobre el capital`,
    tasaAplicada,
    _chart: chart,
    _insight: insight,
  };
}
