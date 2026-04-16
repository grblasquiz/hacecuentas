/** Calculadora de Compás, Tiempo y Pulso Musical */
export interface Inputs {
  bpm: number;
  numerador: number;
  denominador: string;
  compases?: number;
}
export interface Outputs {
  duracionCompas: number;
  duracionBeat: number;
  duracionTotal: number;
  resumen: string;
}

export function compasTiempoPulso(i: Inputs): Outputs {
  const bpm = Number(i.bpm);
  const num = Number(i.numerador);
  const den = Number(i.denominador);
  const compases = i.compases ? Number(i.compases) : 1;

  if (!bpm || bpm <= 0) throw new Error('Ingresá un BPM válido');
  if (!num || num < 1) throw new Error('Ingresá el numerador de la métrica');
  if (!den) throw new Error('Seleccioná el denominador');

  // Duration of a quarter note in ms
  const quarterMs = 60000 / bpm;

  // Duration of the beat unit: if denominator is 4, beat = quarter note
  // if 8, beat = eighth note = half of quarter
  const beatMs = quarterMs * (4 / den);

  // Duration of one measure
  const duracionCompasMs = beatMs * num;
  const duracionCompas = duracionCompasMs / 1000;

  const duracionTotal = duracionCompas * compases;

  const minutos = Math.floor(duracionTotal / 60);
  const segs = duracionTotal % 60;

  return {
    duracionCompas: Number(duracionCompas.toFixed(3)),
    duracionBeat: Number(beatMs.toFixed(1)),
    duracionTotal: Number(duracionTotal.toFixed(2)),
    resumen: `Métrica ${num}/${den} a ${bpm} BPM: cada compás dura ${duracionCompas.toFixed(2)} seg, cada beat ${beatMs.toFixed(0)} ms. ${compases} compases = ${minutos > 0 ? minutos + ' min ' : ''}${segs.toFixed(1)} seg.`,
  };
}
