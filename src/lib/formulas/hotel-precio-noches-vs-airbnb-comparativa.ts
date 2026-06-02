export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hotelPrecioNochesVsAirbnbComparativa(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const _insight = {
    title: 'Tu resultado',
    text: `Con **${v1}** y **${v2}** el resultado da **${r.toFixed(2)}**. Al comparar hotel vs. Airbnb, sumá siempre los extras: tasa de limpieza, comisión de la plataforma y desayuno o estacionamiento incluidos cambian bastante el costo por noche real.`,
    tone: 'neutral',
    icon: '🏨',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
