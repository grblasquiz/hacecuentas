export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function weeklyReviewGtdAllenTiempo6090min(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const _insight = {
    title: 'Tu revisión semanal',
    text: `Con estos números el resultado da **${r.toFixed(2)}**. La weekly review de GTD funciona cuando es un ritual fijo de **60 a 90 minutos**: vaciás bandejas, revisás proyectos y next actions, y dejás el sistema confiable para la semana que viene.`,
    tone: 'neutral' as const,
    icon: '🗂️',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
