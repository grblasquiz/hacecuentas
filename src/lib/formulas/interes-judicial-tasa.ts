/**
 * Calculadora de Interés Judicial - Tasa Activa BNA
 * Interés simple: Capital × (tasa/365) × días
 */

export interface InteresJudicialInputs {
  capital: number;
  tasaAnual?: number;
  tasaPreset?: string;
  fechaDesde: string;
  fechaHasta?: string;
}

export interface InteresJudicialOutputs {
  totalConIntereses: number;
  interesesGenerados: number;
  diasTranscurridos: number;
  porcentajeTotal: string;
  _chart?: any;
  _insight?: any;
}

const TASAS_PRESET: Record<string, { tasa: number; label: string }> = {
  activa_bna_33: { tasa: 33, label: 'tasa activa BNA de referencia 2026 (33% TNA)' },
  activa_bna_38: { tasa: 38, label: 'tasa activa BNA enero 2026 (38% TNA)' },
  resarcitoria_arca_72: { tasa: 72, label: 'tasa resarcitoria ARCA de referencia (72% TNA)' },
  pasiva_referencia_30: { tasa: 30, label: 'tasa pasiva de referencia (30% TNA)' },
};

export function interesJudicialTasa(inputs: InteresJudicialInputs): InteresJudicialOutputs {
  const capital = Number(inputs.capital);
  const preset = TASAS_PRESET[String(inputs.tasaPreset || '')];
  const tasaAnual = preset ? preset.tasa : Number(inputs.tasaAnual);
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
  const insight = {
    title: 'Cuánto pesan los intereses',
    text: `Sobre un capital de **$${Math.round(capital).toLocaleString('es-AR')}**, en **${diasTranscurridos.toLocaleString('es-AR')} días** (${anios.toFixed(1)} años) se acumulan **$${Math.round(interesesGenerados).toLocaleString('es-AR')}** de intereses, un **${porcentajeTotal}%** del capital. ${preset ? `Usé la **${preset.label}**.` : 'Usé la tasa manual que ingresaste.'} El total reclamable asciende a **$${Math.round(totalConIntereses).toLocaleString('es-AR')}**.`,
    tone: insightTone,
    icon: '⚖️',
  };

  return {
    totalConIntereses: Math.round(totalConIntereses),
    interesesGenerados: Math.round(interesesGenerados),
    diasTranscurridos,
    porcentajeTotal: `${porcentajeTotal}% sobre el capital`,
    _chart: chart,
    _insight: insight,
  };
}
