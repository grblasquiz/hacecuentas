export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function divorcioLiquidacionBienesGanancialesCosto(i: Inputs): Outputs {
  const b=Number(i.bienes)||0; const a=String(i.acuerdo||'acuerdo');
  const pct=a==='acuerdo'?0.06:0.12;
  const hon=Math.max(b*pct,1500000);
  const t=a==='acuerdo'?'2-4 meses':'1-3 años';
  return { honorariosEstimados:`$${Math.round(hon).toLocaleString('es-AR')}`, tiempo:t, observacion:a==='acuerdo'?'Divorcio por acuerdo: más rápido, conviene siempre que se pueda.':'Contradictorio: mayores costos + tiempo.' };
}
