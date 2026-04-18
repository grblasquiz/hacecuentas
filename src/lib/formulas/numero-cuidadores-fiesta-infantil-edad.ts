export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function numeroCuidadoresFiestaInfantilEdad(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const n=Number(i.numNinos)||0;
  let ratio:number;
  if (e<=2) ratio=4; else if (e<=3) ratio=5; else if (e<=5) ratio=8; else ratio=10;
  const ad=Math.ceil(n/ratio);
  return { ratio:`1:${ratio}`, adultos:`${ad} adultos`, resumen:`${n} niños de ${e}a: ${ad} adultos (1:${ratio}).` };
}
