/** Cálculo de distancia ideal al monitor según tamaño y resolución */
export interface Inputs { diagonalPulgadas: number; resolucion?: string; }
export interface Outputs { distanciaMinimaM: number; distanciaMaximaM: number; distanciaIdealM: number; detalle: string; }

const factores: Record<string, { min: number; max: number }> = {
  '1080p': { min: 1.5, max: 2.5 },
  '1440p': { min: 1.2, max: 1.7 },
  '4k': { min: 0.8, max: 1.5 },
};

export function monitorTamanoDistanciaIdeal(i: Inputs): Outputs {
  const diagonal = Number(i.diagonalPulgadas);
  const resolucion = String(i.resolucion || '1440p');

  if (!diagonal || diagonal <= 0) throw new Error('Ingresá la diagonal en pulgadas');

  const factor = factores[resolucion] || factores['1440p'];
  const diagonalCm = diagonal * 2.54;

  const minCm = diagonalCm * factor.min;
  const maxCm = diagonalCm * factor.max;
  const idealCm = (minCm + maxCm) / 2;

  return {
    distanciaMinimaM: Number((minCm / 100).toFixed(2)),
    distanciaMaximaM: Number((maxCm / 100).toFixed(2)),
    distanciaIdealM: Number((idealCm / 100).toFixed(2)),
    detalle: `Monitor/TV de ${diagonal}" en ${resolucion}: distancia ideal ${(idealCm / 100).toFixed(2)} m (rango: ${(minCm / 100).toFixed(2)} - ${(maxCm / 100).toFixed(2)} m). A menor distancia se notan píxeles, a mayor no aprovechás la resolución.`,
  };
}
