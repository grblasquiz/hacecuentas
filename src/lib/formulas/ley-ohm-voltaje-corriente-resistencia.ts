/** Ley de Ohm: V = I × R — calcula el valor faltante */
export interface Inputs { voltaje: number; corriente: number; resistencia: number; }
export interface Outputs { resultadoValor: number; resultadoUnidad: string; resultadoMagnitud: string; detalle: string; }

export function leyOhmVoltajeCorrienteResistencia(i: Inputs): Outputs {
  const v = Number(i.voltaje) || 0;
  const iA = Number(i.corriente) || 0;
  const r = Number(i.resistencia) || 0;

  const ceros = [v === 0, iA === 0, r === 0].filter(Boolean).length;
  if (ceros === 0) throw new Error('Dejá uno de los tres valores en 0 para calcularlo');
  if (ceros > 1) throw new Error('Necesitás al menos dos valores conocidos. Solo uno puede ser 0.');

  let resultadoValor: number;
  let resultadoUnidad: string;
  let resultadoMagnitud: string;
  let detalle: string;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });

  if (v === 0) {
    resultadoValor = iA * r;
    resultadoUnidad = 'V';
    resultadoMagnitud = 'Voltaje';
    detalle = `V = I × R = ${fmt.format(iA)} A × ${fmt.format(r)} Ω = ${fmt.format(resultadoValor)} V`;
  } else if (iA === 0) {
    if (r === 0) throw new Error('La resistencia no puede ser 0 para calcular corriente');
    resultadoValor = v / r;
    resultadoUnidad = 'A';
    resultadoMagnitud = 'Corriente';
    detalle = `I = V / R = ${fmt.format(v)} V / ${fmt.format(r)} Ω = ${fmt.format(resultadoValor)} A`;
  } else {
    resultadoValor = v / iA;
    resultadoUnidad = 'Ω';
    resultadoMagnitud = 'Resistencia';
    detalle = `R = V / I = ${fmt.format(v)} V / ${fmt.format(iA)} A = ${fmt.format(resultadoValor)} Ω`;
  }

  return {
    resultadoValor: Number(resultadoValor.toFixed(4)),
    resultadoUnidad,
    resultadoMagnitud,
    detalle,
  };
}
