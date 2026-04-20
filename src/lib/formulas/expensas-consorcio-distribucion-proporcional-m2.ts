export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function expensasConsorcioDistribucionProporcionalM2(i: Inputs): Outputs {
  const t=Number(i.totalExpensa)||0; const m=Number(i.m2UnidadTuya)||0; const me=Number(i.m2Edificio)||1;
  const pct=m/me; const tu=t*pct;
  return { tuExpensa:`$${Math.round(tu).toLocaleString('es-AR')}`, porcentaje:`${(pct*100).toFixed(2)}%`, interpretacion:`Tu unidad (${m} m²) paga el ${(pct*100).toFixed(1)}% de $${(t/1000).toFixed(0)}k = $${Math.round(tu).toLocaleString('es-AR')}.` };
}
