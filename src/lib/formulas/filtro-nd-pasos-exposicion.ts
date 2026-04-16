/** Calculadora de Filtro ND */
export interface Inputs { velocidadSin: number; stopsND: number; }
export interface Outputs { velocidadCon: string; factorND: number; densidadOptica: number; nota: string; }

export function filtroNdPasosExposicion(i: Inputs): Outputs {
  const vel = Number(i.velocidadSin);
  const stops = Number(i.stopsND);
  if (!vel || vel <= 0) throw new Error('Ingresá la velocidad sin filtro');
  if (!stops || stops < 1) throw new Error('Ingresá los stops del filtro ND');

  const factor = Math.pow(2, stops);
  const nuevaVelocidadFraccion = vel / factor;
  const densidadOptica = Number((stops * 0.3).toFixed(1));

  let velocidadCon: string;
  if (nuevaVelocidadFraccion >= 1) {
    velocidadCon = `1/${Math.round(nuevaVelocidadFraccion)} seg`;
  } else {
    const segundos = 1 / nuevaVelocidadFraccion;
    if (segundos < 60) velocidadCon = `${segundos.toFixed(1)} segundos`;
    else velocidadCon = `${(segundos / 60).toFixed(1)} minutos`;
  }

  let nota: string;
  const segs = 1 / nuevaVelocidadFraccion;
  if (segs > 30) nota = 'Necesitás modo Bulb y un timer/intervalómetro. La cámara normal solo llega a 30 seg.';
  else if (segs > 1) nota = 'Usá trípode obligatoriamente para esta velocidad.';
  else nota = 'Velocidad manejable, trípode recomendado para máxima nitidez.';

  return {
    velocidadCon,
    factorND: factor,
    densidadOptica,
    nota,
  };
}
