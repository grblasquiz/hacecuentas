export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function scrumSprintVelocityStoryPoints(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const _insight = {
    title: 'Tu velocity por sprint',
    text: `Repartiendo **${v1} story points** en **${v2}** ${v2 === 1 ? 'sprint' : 'sprints'}, tu velocity promedio es de **${r.toFixed(2)} puntos por sprint** — ese es el ritmo que conviene usar para planificar el próximo.`,
    tone: 'neutral',
    icon: '🏃',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight } as Outputs;
}
