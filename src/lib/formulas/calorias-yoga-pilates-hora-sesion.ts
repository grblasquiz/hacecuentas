export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function caloriasYogaPilatesHoraSesion(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: 'Qué significa este resultado',
    text: `Con los valores **${v1}** y **${v2}** el cálculo da **${r.toFixed(2)}**. El yoga y el pilates suelen quemar entre **180 y 350 kcal por hora** según la intensidad, así que sirve más para complementar tu actividad que como gasto calórico principal.`,
    tone: 'neutral',
    icon: '🧘',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`, _insight };
}
