export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function eloAjedrezGanadoPerdidoVariacion(i: Inputs): Outputs {
  const ea=Number(i.eloActual)||0; const eo=Number(i.eloOponente)||0; const r=String(i.resultado||'gane'); const k=Number(i.kFactor)||20;
  const exp=1/(1+Math.pow(10,(eo-ea)/400));
  const resNum={'gane':1,'tabla':0.5,'perdi':0}[r];
  const delta=k*(resNum-exp);
  const nuevo=ea+delta;
  return { nuevoElo:`${Math.round(nuevo)}`, variacion:`${delta>=0?'+':''}${Math.round(delta)}`, expectativa:`${(exp*100).toFixed(0)}% de ganar` };
}
