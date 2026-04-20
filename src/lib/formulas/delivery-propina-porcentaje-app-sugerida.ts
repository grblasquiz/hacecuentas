export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function deliveryPropinaPorcentajeAppSugerida(i: Inputs): Outputs {
  const m=Number(i.montoPedido)||0; const d=Number(i.distanciaKm)||0; const l=String(i.lluvia||'no');
  let pct=0.08;
  if(d>5) pct+=0.03;
  if(l==='si') pct+=0.05;
  const prop=Math.max(m*pct,300);
  const tot=m+prop;
  return { propinaSugerida:`$${Math.round(prop).toLocaleString('es-AR')} (${(pct*100).toFixed(0)}%)`, totalConPropina:`$${Math.round(tot).toLocaleString('es-AR')}`, interpretacion:l==='si'?'Clima extremo: propina ${(pct*100).toFixed(0)}% recomendada.':`Propina sugerida: ${(pct*100).toFixed(0)}% del pedido.` };
}
