/**
 * Calculadora de Interés Judicial - Tasa Activa BNA
 * Interés simple: Capital × (tasa/365) × días
 */

export interface InteresJudicialInputs {
  capital: number;
  tasaAnual: number;
  fechaDesde: string;
  fechaHasta?: string;
}

export interface InteresJudicialOutputs {
  totalConIntereses: number;
  interesesGenerados: number;
  diasTranscurridos: number;
  porcentajeTotal: string;
}

export function interesJudicialTasa(inputs: InteresJudicialInputs): InteresJudicialOutputs {
  const capital = Number(inputs.capital);
  const tasaAnual = Number(inputs.tasaAnual);
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

  return {
    totalConIntereses: Math.round(totalConIntereses),
    interesesGenerados: Math.round(interesesGenerados),
    diasTranscurridos,
    porcentajeTotal: `${porcentajeTotal}% sobre el capital`,
  };
}
