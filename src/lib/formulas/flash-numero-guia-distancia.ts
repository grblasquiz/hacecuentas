/** Calculadora de Número Guía de Flash */
export interface Inputs { gn: number; apertura: number; iso: number; }
export interface Outputs { distancia: number; gnEfectivo: number; potenciaSugerida: string; mensaje: string; }

export function flashNumeroGuiaDistancia(i: Inputs): Outputs {
  const gn = Number(i.gn);
  const f = Number(i.apertura);
  const iso = Number(i.iso);
  if (!gn || gn <= 0) throw new Error('Ingresá el número guía');
  if (!f || f <= 0) throw new Error('Ingresá la apertura');
  if (!iso || iso <= 0) throw new Error('Ingresá el ISO');

  const gnEfectivo = gn * Math.sqrt(iso / 100);
  const distancia = gnEfectivo / f;

  let potenciaSugerida: string;
  if (distancia > 15) potenciaSugerida = 'Full power (1/1). Tu flash tiene alcance de sobra.';
  else if (distancia > 8) potenciaSugerida = '1/2 a 1/1 power. Buen alcance.';
  else if (distancia > 4) potenciaSugerida = '1/4 a 1/2 power. Distancia media.';
  else potenciaSugerida = '1/8 a 1/4 power. Alcance limitado, acercate al sujeto.';

  return {
    distancia: Number(distancia.toFixed(1)),
    gnEfectivo: Number(gnEfectivo.toFixed(0)),
    potenciaSugerida,
    mensaje: `Con GN ${gn} a ISO ${iso} y f/${f}: alcance máximo ${distancia.toFixed(1)} metros. GN efectivo: ${gnEfectivo.toFixed(0)}.`,
  };
}
