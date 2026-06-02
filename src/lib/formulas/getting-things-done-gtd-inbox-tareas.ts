export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function gettingThingsDoneGtdInboxTareas(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const _insight = {
    title: 'Tu resultado',
    text: `Te da **${r.toFixed(2)}**: por cada unidad del segundo valor entran **${r.toFixed(2)}** del primero (${v1} ÷ ${v2}).`,
    tone: 'neutral' as const,
    icon: '✅',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
