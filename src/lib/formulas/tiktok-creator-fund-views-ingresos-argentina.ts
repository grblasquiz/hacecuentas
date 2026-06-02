export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tiktokCreatorFundViewsIngresosArgentina(i: Inputs): Outputs {
  const v=Number(i.viewsMensuales)||0;
  const ingreso=v/1000*0.03;
  const _insight = {
    title: 'Lo que paga TikTok en Argentina',
    text: `Con **${v.toLocaleString('es-AR')} views/mes** el fondo te deja apenas **USD ${ingreso.toFixed(2)} al mes** (≈USD 0,03 por cada 1000 views). El RPM en Argentina es de los más bajos del mundo: el ingreso real llega por **canjes con marcas, TikTok Shop y regalos en lives**, no por las vistas.`,
    tone: 'warn',
    icon: '💸',
  };
  return { ingresoEstimado:`USD ${ingreso.toFixed(2)}/mes`, porKView:'USD 0.02-0.04 por 1000 views', alternativas:'UGC brand deals, TikTok Shop comisiones, lives con gifts.', _insight };
}
