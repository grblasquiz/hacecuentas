/** Calculadora de Energía Potencial Gravitatoria — Ep = mgh */
export interface Inputs {
  masa: number;
  altura: number;
  gravedad: number;
}
export interface Outputs {
  energiaJ: number;
  energiaKJ: number;
  velocidadCaida: number;
  formula: string;
}

export function energiaPotencialGravitatoria(i: Inputs): Outputs {
  const m = Number(i.masa);
  const h = Number(i.altura);
  const g = Number(i.gravedad) || 9.81;
  if (!m || m <= 0) throw new Error('La masa debe ser mayor a 0');
  if (h < 0) throw new Error('La altura no puede ser negativa');

  const ep = m * g * h;
  const epKJ = ep / 1000;
  // Velocidad al caer desde esa altura (conservación de energía, sin fricción): v = √(2gh)
  const vCaida = Math.sqrt(2 * g * h);

  return {
    energiaJ: Number(ep.toFixed(2)),
    energiaKJ: Number(epKJ.toFixed(4)),
    velocidadCaida: Number(vCaida.toFixed(2)),
    formula: `Ep = ${m} × ${g} × ${h} = ${ep.toFixed(2)} J`,
  };
}
