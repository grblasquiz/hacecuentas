export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function runwayStartupCashBurnRateMeses(i: Inputs): Outputs {
  const c=Number(i.cashDisponible)||0; const b=Number(i.burnMensual)||1;
  const m=c/b;
  const fechaDias=m*30;
  const fecha=new Date(Date.now()+fechaDias*86400000);
  let rec='';
  if(m>18) rec='Cómodo. Enfocate en ejecución.';
  else if(m>12) rec='OK. Planifica próxima ronda en 6 meses.';
  else if(m>6) rec='Empieza fundraising YA o reducir burn.';
  else rec='CRÍTICO. Layoffs, pivot o cerrar.';
  return { runwayMeses:`${m.toFixed(1)} meses`, fechaLimite:fecha.toISOString().slice(0,10), recomendacion:rec };
}
