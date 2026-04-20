export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function backtestEstrategiaTradingSharpeRatio(i: Inputs): Outputs {
  const r=Number(i.retornoAnual)||0; const v=Number(i.volatilidad)||1; const rf=Number(i.tasaLibreRiesgo)||0;
  const sharpe=(r-rf)/v;
  let interp='';
  if(sharpe>2) interp='Excelente (>2)';
  else if(sharpe>1) interp='Bueno (1-2)';
  else if(sharpe>0) interp='Aceptable (0-1)';
  else interp='Pobre (negativo)';
  return { sharpeRatio:sharpe.toFixed(2), interpretacion:`Sharpe ${sharpe.toFixed(2)}: ${interp}` };
}
