/** Cálculo de distancia ideal al monitor según tamaño y resolución */
export interface Inputs { diagonalPulgadas: number; resolucion?: string; }
export interface Outputs { distanciaMinimaM: number; distanciaMaximaM: number; distanciaIdealM: number; detalle: string; _insight?: any; _chart?: any; }

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

  const minM = Number((minCm / 100).toFixed(2));
  const maxM = Number((maxCm / 100).toFixed(2));
  const idealM = Number((idealCm / 100).toFixed(2));

  return {
    distanciaMinimaM: minM,
    distanciaMaximaM: maxM,
    distanciaIdealM: idealM,
    detalle: `Monitor/TV de ${diagonal}" en ${resolucion}: distancia ideal ${idealM.toFixed(2)} m (rango: ${minM.toFixed(2)} - ${maxM.toFixed(2)} m). A menor distancia se notan píxeles, a mayor no aprovechás la resolución.`,
    _insight: {
      title: 'Distancia ideal de visión',
      text: `Para un panel de **${diagonal}" en ${resolucion}**, sentate a unos **${idealM.toFixed(2)} m** (rango cómodo: ${minM.toFixed(2)}–${maxM.toFixed(2)} m). Más cerca empezás a distinguir píxeles; más lejos, desperdiciás la resolución que pagaste.`,
      tone: 'neutral',
      icon: '🖥️',
    },
    _chart: {
      type: 'scale' as const,
      marker: idealM,
      markerLabel: `Ideal ${idealM.toFixed(2)} m`,
      min: 0,
      segments: [
        { nombre: 'Muy cerca', max: minM, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Distancia ideal', max: maxM, color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Muy lejos', max: Number((maxM * 1.6).toFixed(2)), color: '#f59e0b', colorDark: '#b45309' },
      ],
      ariaLabel: `Distancia ideal ${idealM.toFixed(2)} m dentro del rango cómodo de ${minM.toFixed(2)} a ${maxM.toFixed(2)} metros`,
    },
  };
}
