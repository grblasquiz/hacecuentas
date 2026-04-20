export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function uvaHipotecaVsInflacionRiesgo(i: Inputs): Outputs {
  const c=Number(i.cuotaInicial)||0; const inf=Number(i.inflacionAnual)||0; const a=Number(i.anos)||0;
  const mult=(1+inf/100)**a; const cf=c*mult;
  return { cuotaFinal:`$${Math.round(cf).toLocaleString('es-AR')}`, multiplicador:`${mult.toFixed(2)}x`, interpretacion:`Con ${inf}% inflación anual durante ${a} años, tu cuota UVA se multiplica por ${mult.toFixed(1)}.` };
}
