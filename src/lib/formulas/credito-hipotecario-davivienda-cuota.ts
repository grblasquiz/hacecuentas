export interface Inputs { valor_vivienda:number; cuota_inicial:number; tasa_ea:number; plazo_anos:number; seguros_mensuales:number; }
export interface Outputs { monto_financiado:number; cuota_credito:number; cuota_total:number; total_pagado:number; intereses_estimados:number; resumen:string; _insight?:any; }
export function compute(i:Inputs):Outputs {
  const valor=Math.max(0,Number(i.valor_vivienda)||0), inicial=Math.min(valor,Math.max(0,Number(i.cuota_inicial)||0)), principal=valor-inicial;
  const n=Math.max(1,Math.round((Number(i.plazo_anos)||1)*12)), ea=Math.max(0,Number(i.tasa_ea)||0)/100, r=Math.pow(1+ea,1/12)-1;
  const cuota=r ? principal*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : principal/n;
  const seguro=Math.max(0,Number(i.seguros_mensuales)||0), total=cuota+seguro, pagado=total*n, intereses=Math.max(0,pagado-principal-seguro*n), fmt=(x:number)=>'$'+Math.round(x).toLocaleString('es-CO');
  return { monto_financiado:Math.round(principal), cuota_credito:Math.round(cuota), cuota_total:Math.round(total), total_pagado:Math.round(pagado), intereses_estimados:Math.round(intereses), resumen:`Financiás ${fmt(principal)} a ${n} meses. La cuota estimada sin seguros es ${fmt(cuota)}.`, _insight:{title:'Cuota hipotecaria estimada',text:`Para financiar **${fmt(principal)}** a ${Number(i.plazo_anos)||1} años, tu cuota estimada es **${fmt(total)}/mes** incluyendo los seguros que ingresaste. Confirmá tasa, seguros y avalúo con Davivienda.`,tone:'neutral',icon:'🏠'} };
}
