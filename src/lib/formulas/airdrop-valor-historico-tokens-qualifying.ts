export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function airdropValorHistoricoTokensQualifying(i: Inputs): Outputs {
  const h=Number(i.horasInvertidas)||0; const v=Number(i.airdropValorUsd)||0;
  const porH=h>0?v/h:0;
  let interp='';
  if(porH>50) interp='Excepcional (>USD 50/h)';
  else if(porH>20) interp='Muy bueno (USD 20-50/h)';
  else if(porH>10) interp='Bueno';
  else interp='Pobre — considerar trabajo alternativo';
  return { valorPorHora:`USD ${porH.toFixed(2)}/h`, interpretacion:interp };
}
