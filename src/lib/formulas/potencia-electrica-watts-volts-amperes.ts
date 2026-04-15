/** Potencia eléctrica P = V × I — calcula el valor faltante */
export interface Inputs { potencia: number; voltaje: number; corriente: number; }
export interface Outputs { resultadoValor: number; resultadoUnidad: string; resultadoMagnitud: string; detalle: string; }

export function potenciaElectricaWattsVoltsAmperes(i: Inputs): Outputs {
  const p = Number(i.potencia) || 0;
  const v = Number(i.voltaje) || 0;
  const iA = Number(i.corriente) || 0;

  const ceros = [p === 0, v === 0, iA === 0].filter(Boolean).length;
  if (ceros === 0) throw new Error('Dejá uno de los tres valores en 0 para calcularlo');
  if (ceros > 1) throw new Error('Necesitás al menos dos valores conocidos. Solo uno puede ser 0.');

  let resultadoValor: number;
  let resultadoUnidad: string;
  let resultadoMagnitud: string;
  let detalle: string;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });

  if (p === 0) {
    resultadoValor = v * iA;
    resultadoUnidad = 'W';
    resultadoMagnitud = 'Potencia';
    detalle = `P = V × I = ${fmt.format(v)} V × ${fmt.format(iA)} A = ${fmt.format(resultadoValor)} W`;
  } else if (v === 0) {
    if (iA === 0) throw new Error('La corriente no puede ser 0 para calcular voltaje');
    resultadoValor = p / iA;
    resultadoUnidad = 'V';
    resultadoMagnitud = 'Voltaje';
    detalle = `V = P / I = ${fmt.format(p)} W / ${fmt.format(iA)} A = ${fmt.format(resultadoValor)} V`;
  } else {
    resultadoValor = p / v;
    resultadoUnidad = 'A';
    resultadoMagnitud = 'Corriente';
    detalle = `I = P / V = ${fmt.format(p)} W / ${fmt.format(v)} V = ${fmt.format(resultadoValor)} A`;
  }

  return {
    resultadoValor: Number(resultadoValor.toFixed(4)),
    resultadoUnidad,
    resultadoMagnitud,
    detalle,
  };
}
