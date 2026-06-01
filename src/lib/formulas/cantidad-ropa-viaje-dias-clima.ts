export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadRopaViajeDiasClima(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const _insight = {
    title: 'Llevá de menos, lavá en destino',
    text: `Te da **${r.toFixed(0)} prendas** estimadas. Para viajes largos no multipliques por día: con lavar una vez a mitad de viaje llevás la mitad de valija y todo entra de carry-on.`,
    tone: 'neutral',
    icon: '🧳',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
