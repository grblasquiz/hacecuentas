export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function determinanteInversaMatriz2x2(i: Inputs): Outputs {
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return { det:'0', inversa:'—', resumen:'Matriz singular, sin inversa.' };
  const f=1/det;
  const inv=`[[${(d*f).toFixed(3)}, ${(-b*f).toFixed(3)}], [${(-c*f).toFixed(3)}, ${(a*f).toFixed(3)}]]`;
  return { det:det.toFixed(3), inversa:inv, resumen:`det=${det.toFixed(2)}, invertible.` };
}
