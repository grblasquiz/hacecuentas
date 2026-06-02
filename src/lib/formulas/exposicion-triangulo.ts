/** Calculadora del Triángulo de Exposición */
export interface Inputs { isoActual: number; aperturaActual: number; velocidadActual: number; parametroCambio: string; nuevoValor: number; }
export interface Outputs { compensacion: number; isoEquiv: number; aperturaEquiv: number; velocidadEquiv: number; _insight?: any; }

export function exposicionTriangulo(i: Inputs): Outputs {
  const iso = Number(i.isoActual);
  const apt = Number(i.aperturaActual);
  const vel = Number(i.velocidadActual);
  const nv = Number(i.nuevoValor);

  if (!iso || iso <= 0) throw new Error('Ingresá el ISO actual');
  if (!apt || apt <= 0) throw new Error('Ingresá la apertura actual');
  if (!vel || vel <= 0) throw new Error('Ingresá la velocidad actual');
  if (!nv || nv <= 0) throw new Error('Ingresá el nuevo valor');

  let stops: number;
  let isoEquiv = iso;
  let aperturaEquiv = apt;
  let velocidadEquiv = vel;

  switch (i.parametroCambio) {
    case 'iso':
      stops = Math.log2(nv / iso);
      isoEquiv = nv;
      // Compensate: reduce exposure by same stops via speed
      velocidadEquiv = vel * Math.pow(2, stops);
      // Or via aperture
      aperturaEquiv = apt * Math.pow(2, stops / 2);
      break;
    case 'apertura':
      stops = 2 * Math.log2(nv / apt); // aperture stops
      aperturaEquiv = nv;
      velocidadEquiv = vel * Math.pow(2, -stops);
      isoEquiv = iso * Math.pow(2, stops);
      break;
    case 'velocidad':
      stops = Math.log2(nv / vel);
      velocidadEquiv = nv;
      isoEquiv = iso * Math.pow(2, stops);
      aperturaEquiv = apt * Math.pow(2, -stops / 2);
      break;
    default:
      throw new Error('Seleccioná qué parámetro cambiar');
  }

  const absS = Math.abs(stops);
  const cambiado = i.parametroCambio === 'iso' ? `ISO ${nv}` : i.parametroCambio === 'apertura' ? `f/${nv}` : `1/${nv} s`;
  const subio = stops > 0;

  return {
    compensacion: Number(stops.toFixed(1)),
    isoEquiv: Math.round(isoEquiv),
    aperturaEquiv: Number(aperturaEquiv.toFixed(1)),
    velocidadEquiv: Math.round(velocidadEquiv),
    _insight: {
      title: 'Compensá para igualar la luz',
      text: `Pasar a **${cambiado}** mueve la exposición **${subio ? '+' : ''}${stops.toFixed(1)} stops**. Para mantener la misma foto, ajustá los otros dos: **ISO ${Math.round(isoEquiv)}**, **f/${aperturaEquiv.toFixed(1)}** y **1/${Math.round(velocidadEquiv)} s** quedan equivalentes. ${absS < 0.1 ? 'El cambio es mínimo, casi no necesitás compensar.' : 'Repartí los ' + absS.toFixed(1) + ' stops entre apertura y obturador según busques profundidad o congelar movimiento.'}`,
      tone: 'neutral',
      icon: '📸',
    },
  };
}
