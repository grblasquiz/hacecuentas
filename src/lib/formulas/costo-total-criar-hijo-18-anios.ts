export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoTotalCriarHijo18Anios(i: Inputs): Outputs {
  const m=Number(i.mensual)||0; const inf=Number(i.infl)||0;
  let tot=0, presente=0;
  for (let k=0;k<18;k++) { const costAnio=m*12*Math.pow(1+inf/100,k); tot+=costAnio; presente+=m*12; }
  return { totalNom:`$${tot.toFixed(0)}`, totalReal:`$${presente.toFixed(0)}`, resumen:`18 años a $${m}/mes: nominal $${tot.toFixed(0)}.` };
}
