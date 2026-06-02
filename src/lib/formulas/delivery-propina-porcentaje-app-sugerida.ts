export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function deliveryPropinaPorcentajeAppSugerida(i: Inputs): Outputs {
  const m=Number(i.montoPedido)||0; const d=Number(i.distanciaKm)||0; const l=String(i.lluvia||'no');
  let pct=0.08;
  if(d>5) pct+=0.03;
  if(l==='si') pct+=0.05;
  const prop=Math.max(m*pct,300);
  const tot=m+prop;
  const propR=Math.round(prop); const totR=Math.round(tot); const mR=Math.round(m);
  const pisoActivo = m*pct < 300;
  const tono: 'good' | 'warn' | 'neutral' = (d>5 || l==='si') ? 'warn' : 'good';
  const motivo = l==='si'
    ? `incluye +5% por lluvia${d>5?' y +3% por distancia':''}`
    : (d>5 ? 'incluye +3% por la distancia (>5 km)' : 'es la base sugerida para un pedido estándar');
  const _insight = {
    title: 'Propina sugerida',
    text: pisoActivo
      ? `Por **$${mR.toLocaleString('es-AR')}** el ${(pct*100).toFixed(0)}% daría menos del mínimo, así que se aplica el **piso de $300** (total: **$${totR.toLocaleString('es-AR')}**).`
      : `Sobre **$${mR.toLocaleString('es-AR')}**, una propina del **${(pct*100).toFixed(0)}%** son **$${propR.toLocaleString('es-AR')}** (total **$${totR.toLocaleString('es-AR')}**) — ${motivo}.`,
    tone: tono,
    icon: '🛵',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Pedido', value: mR },
      { label: 'Propina', value: propR },
    ],
    prefix: '$',
    centerValue: `$${totR.toLocaleString('es-AR')}`,
    centerLabel: 'total a pagar',
    ariaLabel: `Total de $${totR.toLocaleString('es-AR')}: $${mR.toLocaleString('es-AR')} del pedido más $${propR.toLocaleString('es-AR')} de propina`,
  };
  return { propinaSugerida:`$${Math.round(prop).toLocaleString('es-AR')} (${(pct*100).toFixed(0)}%)`, totalConPropina:`$${Math.round(tot).toLocaleString('es-AR')}`, interpretacion:l==='si'?`Clima extremo: propina ${(pct*100).toFixed(0)}% recomendada.`:`Propina sugerida: ${(pct*100).toFixed(0)}% del pedido.`, _insight, _chart };
}
