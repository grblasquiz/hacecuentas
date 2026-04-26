// Calculadora de Horas Extras Dobles y Triples (México)
// Base legal: Ley Federal del Trabajo, Arts. 67 y 68 (vigente 2026).
// Fuente: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf

export interface Inputs {
  salarioDiario: number;
  jornadaDiaria: number;
  horasExtraSemana: number;
}

export interface Outputs {
  pagoTotalExtras: number;
  pagoDobles: number;
  pagoTriples: number;
  detalle: string;
}

/**
 * Calcula el pago semanal por tiempo extraordinario conforme a LFT Arts. 67-68.
 * - Primeras 9 horas extra a la semana: pago al DOBLE (200% del valor por hora normal).
 * - Horas extra que excedan 9 a la semana: pago al TRIPLE (300% del valor normal).
 * - Trabajar mas de 9 hrs extra/semana es ilegal aunque se pague al triple (Art. 66 LFT).
 */
export function horasExtrasMexico(inputs: Inputs): Outputs {
  const salarioDiario = Number(inputs.salarioDiario);
  const jornadaDiaria = Number(inputs.jornadaDiaria);
  const horasExtraSemana = Number(inputs.horasExtraSemana);

  // Validaciones
  if (!isFinite(salarioDiario) || salarioDiario <= 0) {
    throw new Error('El salario diario debe ser mayor a 0.');
  }
  if (!isFinite(jornadaDiaria) || jornadaDiaria <= 0 || jornadaDiaria > 12) {
    throw new Error('La jornada diaria debe estar entre 1 y 12 horas.');
  }
  if (!isFinite(horasExtraSemana) || horasExtraSemana < 0) {
    throw new Error('Las horas extra no pueden ser negativas.');
  }

  // Paso 1: Valor de la hora ordinaria
  const valorHoraNormal = salarioDiario / jornadaDiaria;

  // Paso 2: Separar horas dobles (primeras 9) y triples (excedente)
  const TOPE_DOBLES = 9; // LFT Art. 66: maximo legal de 9 hrs extra/semana
  const horasDobles = Math.min(horasExtraSemana, TOPE_DOBLES);
  const horasTriples = Math.max(0, horasExtraSemana - TOPE_DOBLES);

  // Paso 3: Aplicar factores (200% y 300%)
  const pagoDobles = horasDobles * valorHoraNormal * 2;
  const pagoTriples = horasTriples * valorHoraNormal * 3;
  const pagoTotalExtras = pagoDobles + pagoTriples;

  // Detalle textual
  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let detalle =
    `Valor hora normal: ${fmt(valorHoraNormal)} (salario ${fmt(salarioDiario)} / ${jornadaDiaria} hrs).\n` +
    `Horas dobles: ${horasDobles} hrs x ${fmt(valorHoraNormal)} x 2 = ${fmt(pagoDobles)}.\n` +
    `Horas triples: ${horasTriples} hrs x ${fmt(valorHoraNormal)} x 3 = ${fmt(pagoTriples)}.\n` +
    `Total a pagar: ${fmt(pagoTotalExtras)}.`;

  if (horasTriples > 0) {
    detalle +=
      `\nAdvertencia: trabajar mas de 9 hrs extra a la semana es ilegal segun el Art. 66 LFT, ` +
      `aunque deba pagarse al triple. El patron puede ser sancionado por la STPS.`;
  }

  return {
    pagoTotalExtras: Math.round(pagoTotalExtras * 100) / 100,
    pagoDobles: Math.round(pagoDobles * 100) / 100,
    pagoTriples: Math.round(pagoTriples * 100) / 100,
    detalle,
  };
}
