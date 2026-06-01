export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autonomiaTanqueLlenoKilometros(i: Inputs): Outputs {
  const c=Number(i.cap)||0; const r=Number(i.rend)||0;
  const km=c*r;
  const _insight = {
    title: 'Tu autonomía real',
    text: `Con ${c} litros y un rendimiento de **${r} km/L**, recorrés hasta **${km.toFixed(0)} km** con el tanque lleno. Tené en cuenta que el consumo real sube en ciudad, con aire acondicionado o a alta velocidad, así que dejá un margen y no apures la reserva.`,
    tone: 'neutral',
    icon: '⛽',
  };
  return { km:`${km.toFixed(0)} km`, resumen:`${c}L × ${r}km/L = ${km.toFixed(0)} km.`, _insight };
}
