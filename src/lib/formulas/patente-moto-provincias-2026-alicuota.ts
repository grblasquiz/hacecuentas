export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function patenteMotoProvincias2026Alicuota(i: Inputs): Outputs {
  const c=Number(i.cilindradaCc)||0; const p=String(i.provincia||'pba'); const v=Number(i.valorFiscal)||0;
  let aliq=0.03;
  if(c<100) aliq=0.015;
  else if(c<250) aliq=0.03;
  else if(c<500) aliq=0.04;
  else aliq=0.05;
  if(p==='caba') aliq*=1.1;
  const total=v*aliq;
  return { patenteAnual:`$${Math.round(total).toLocaleString('es-AR')}`, cuotas:'3-5 cuotas según provincia', observacion:c<100?'Puede estar exenta según provincia.':`Alícuota ${(aliq*100).toFixed(1)}% sobre valor fiscal.` };
}
