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
  const fechaDesde = new Date(inputs.fechaDesde + 'T00:00:00');
  const fechaHasta = inputs.fechaHasta ? new Date(inputs.fechaHasta + 'T00:00:00') : new Date();

  if (!capital || capital <= 0) throw new Error('Ingresá el capital de la deuda');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá la tasa anual');
  if (isNaN(fechaDesde.getTime())) throw new Error('Ingresá una fecha desde válida');
  if (fechaDesde > fechaHasta) throw new Error('La fecha desde no puede ser posterior a la fecha hasta');

  const diffMs = fechaHasta.getTime() - fechaDesde.getTime();
  const diasTranscurridos = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
