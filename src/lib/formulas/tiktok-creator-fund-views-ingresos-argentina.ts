export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiktokCreatorFundViewsIngresosArgentina(i: Inputs): Outputs {
  const v=Number(i.viewsMensuales)||0;
  const ingreso=v/1000*0.03;
  return { ingresoEstimado:`USD ${ingreso.toFixed(2)}/mes`, porKView:'USD 0.02-0.04 por 1000 views', alternativas:'UGC brand deals, TikTok Shop comisiones, lives con gifts.' };
}
