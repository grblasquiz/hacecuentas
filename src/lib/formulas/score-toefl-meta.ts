/** Score TOEFL para tu Meta */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  comentario: string;
}

export function scoreToeflMeta(i: Inputs): Outputs {
  const total = Number(i.scoreTotal) || 100;
  const debil = String(i.seccionDebil || 'ninguna');
  if (total < 40 || total > 120) throw new Error('Score entre 40-120');

  const prom = total / 4;
  let R = prom, L = prom, S = prom, W = prom;

  if (debil !== 'ninguna') {
    const delta = 3;
    if (debil === 'reading') { R -= delta; L += delta/3; S += delta/3; W += delta/3; }
    if (debil === 'listening') { L -= delta; R += delta/3; S += delta/3; W += delta/3; }
    if (debil === 'speaking') { S -= delta; R += delta/3; L += delta/3; W += delta/3; }
    if (debil === 'writing') { W -= delta; R += delta/3; L += delta/3; S += delta/3; }
  }

  R = Math.min(30, Math.max(0, Math.round(R)));
  L = Math.min(30, Math.max(0, Math.round(L)));
  S = Math.min(30, Math.max(0, Math.round(S)));
  W = Math.min(30, Math.max(0, Math.round(W)));

  const suma = R + L + S + W;
  let coment = '';
  if (total >= 110) coment = 'Nivel top universidades. 6-10 meses prep desde C1.';
  else if (total >= 100) coment = 'Nivel universidad top 50. 4-6 meses desde B2 sólido.';
  else if (total >= 80) coment = 'Nivel state university. 2-4 meses desde B2.';
  else coment = 'Nivel community college o intermedio. 1-3 meses desde B1-B2.';

  return { reading: R, listening: L, speaking: S, writing: W, comentario: `${coment} Total aprox ${suma}` };

}
