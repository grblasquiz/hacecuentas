/** Calculadora de Delay/Reverb sincronizado a BPM */
export interface Inputs {
  bpm: number;
}
export interface Outputs {
  negra: number;
  corchea: number;
  semicorchea: number;
  tresillo: number;
  puntillo: number;
  preDelay: number;
}

export function delayTiempoMsBpm(i: Inputs): Outputs {
  const bpm = Number(i.bpm);
  if (!bpm || bpm <= 0) throw new Error('Ingresá un BPM válido');

  const negra = 60000 / bpm;                  // 1/4 note
  const corchea = negra / 2;                   // 1/8 note
  const semicorchea = negra / 4;               // 1/16 note
  const tresillo = negra * 2 / 3;             // 1/8 triplet
  const puntillo = corchea * 1.5;             // dotted 1/8
  const preDelay = negra / 16;                 // 1/64 note, ~good pre-delay

  return {
    negra: Number(negra.toFixed(1)),
    corchea: Number(corchea.toFixed(1)),
    semicorchea: Number(semicorchea.toFixed(1)),
    tresillo: Number(tresillo.toFixed(1)),
    puntillo: Number(puntillo.toFixed(1)),
    preDelay: Number(preDelay.toFixed(1)),
  };
}
