export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function carryOnLiquidos100MlReglasAeropuerto(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const _insight = {
    title: 'Tu resultado',
    text: `Con los valores ingresados (**${v1}** y **${v2}**), el cálculo da **${r.toFixed(2)}**. Recordá la regla 3-1-1: cada envase hasta **100 ml** y todos dentro de una bolsa transparente de **1 litro** por pasajero.`,
    tone: 'neutral',
    icon: '🧴',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
