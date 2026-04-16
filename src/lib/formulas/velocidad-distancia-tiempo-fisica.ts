/** Calculadora de Velocidad, Distancia y Tiempo — v = d/t */
export interface Inputs {
  distancia?: number;
  velocidad?: number;
  tiempo?: number;
}
export interface Outputs {
  resultado: string;
  velocidadMs: number;
  velocidadKmh: number;
  formula: string;
}

export function velocidadDistanciaTiempoFisica(i: Inputs): Outputs {
  const d = i.distancia != null && i.distancia !== 0 ? Number(i.distancia) : null;
  const v = i.velocidad != null && i.velocidad !== 0 ? Number(i.velocidad) : null;
  const t = i.tiempo != null && i.tiempo !== 0 ? Number(i.tiempo) : null;

  const filled = [d, v, t].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores (distancia, velocidad, tiempo)');

  let velKmh: number;
  let dist: number;
  let time: number;
  let resultado: string;
  let formula: string;

  if (v === null && d !== null && t !== null) {
    if (t <= 0) throw new Error('El tiempo debe ser mayor a 0');
    velKmh = d / t;
    resultado = `Velocidad = ${velKmh.toFixed(2)} km/h`;
    formula = `v = d / t = ${d} / ${t} = ${velKmh.toFixed(2)} km/h`;
  } else if (d === null && v !== null && t !== null) {
    dist = v * t;
    velKmh = v;
    resultado = `Distancia = ${dist.toFixed(2)} km`;
    formula = `d = v × t = ${v} × ${t} = ${dist.toFixed(2)} km`;
  } else if (t === null && d !== null && v !== null) {
    if (v <= 0) throw new Error('La velocidad debe ser mayor a 0');
    time = d / v;
    velKmh = v;
    resultado = `Tiempo = ${time.toFixed(4)} horas (${(time * 60).toFixed(1)} minutos)`;
    formula = `t = d / v = ${d} / ${v} = ${time.toFixed(4)} h`;
  } else {
    velKmh = v!;
    resultado = `Todos los valores ingresados. Velocidad: ${v} km/h, Distancia: ${d} km, Tiempo: ${t} h`;
    formula = `v = d / t → ${v} = ${d} / ${t}`;
  }

  const velocidadMs = Number((velKmh / 3.6).toFixed(4));
  const velocidadKmhOut = Number(velKmh.toFixed(4));

  return { resultado, velocidadMs, velocidadKmh: velocidadKmhOut, formula };
}
