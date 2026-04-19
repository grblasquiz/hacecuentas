export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function lecheFormulaBiberonCantidadPesoBebe(i: Inputs): Outputs {
  const p=Number(i.pesoBebe)||0; const t=Number(i.tomasPorDia)||6;
  const tot=p*150;
  const porToma=tot/t;
  return { mlPorTomaGp:porToma.toFixed(0)+' ml', mlDiaTotal:tot.toFixed(0)+' ml/día', resumen:`Bebé ${p}kg, ${t} tomas: ${porToma.toFixed(0)} ml/biberón (total ${tot.toFixed(0)} ml/día).` };
}
