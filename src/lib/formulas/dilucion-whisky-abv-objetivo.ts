/** Dilución whisky */
export interface Inputs { mlWhisky: number; abvActual: number; abvObjetivo: number; }
export interface Outputs { mlAgua: number; gotas: number; mlFinal: number; recomendacion: string; }

export function dilucionWhiskyAbvObjetivo(i: Inputs): Outputs {
  const v = Number(i.mlWhisky);
  const a = Number(i.abvActual);
  const o = Number(i.abvObjetivo);
  if (!v || v <= 0) throw new Error('Ingresá ml');
  if (!a || a <= 0) throw new Error('Ingresá ABV actual');
  if (!o || o <= 0) throw new Error('Ingresá ABV objetivo');
  if (o >= a) throw new Error('ABV objetivo debe ser menor que actual');

  const agua = v * ((a / o) - 1);
  const gotas = agua / 0.05;
  const final = v + agua;

  let rec = '';
  if (agua < 1) rec = 'Dilución mínima — 1-2 gotas para abrir aromas.';
  else if (agua < 5) rec = 'Dilución moderada — agregá de a 2-3 gotas y probá.';
  else if (agua < 15) rec = 'Dilución fuerte — el whisky cambia notablemente.';
  else rec = 'Dilución muy fuerte — considerá si querés esa cantidad.';

  return {
    mlAgua: Number(agua.toFixed(2)),
    gotas: Number(gotas.toFixed(0)),
    mlFinal: Number(final.toFixed(2)),
    recomendacion: rec,
  };
}
