export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function macrosDietaKetoCetogenicaCalculadora(i: Inputs): Outputs {
  const c=Number(i.calorias)||2000; const n=String(i.nivel||'estricto');
  const rat: Record<string,[number,number,number]> = { estricto:[0.75,0.20,0.05], moderado:[0.70,0.22,0.08], ciclico:[0.60,0.25,0.15] };
  const [pg,pp,pc]=rat[n]||rat.estricto;
  const grasaG=c*pg/9, protG=c*pp/4, carbsG=c*pc/4;
  const grasaKcal=Math.round(c*pg), protKcal=Math.round(c*pp), carbsKcal=Math.round(c*pc);
  const nombreNivel = n==='estricto' ? 'estricta (75/20/5)' : n==='moderado' ? 'moderada (70/22/8)' : 'cíclica (60/25/15)';
  const _insight = {
    title: 'Tu reparto keto',
    text: `En keto ${nombreNivel}, la grasa aporta el grueso de tu energía: **${grasaG.toFixed(0)}g de grasa** (${(pg*100).toFixed(0)}% de las calorías) frente a sólo **${carbsG.toFixed(0)}g de carbos**. Esos carbos tan bajos son los que mantienen la cetosis.`,
    tone: 'neutral' as const,
    icon: '🥑',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Grasa', value: grasaKcal },
      { label: 'Proteína', value: protKcal },
      { label: 'Carbos', value: carbsKcal },
    ],
    prefix: '',
    centerValue: `${c} kcal`,
    centerLabel: 'por día',
    ariaLabel: `Reparto de calorías en keto ${n}: ${grasaG.toFixed(0)}g grasa, ${protG.toFixed(0)}g proteína y ${carbsG.toFixed(0)}g carbos, total ${c} kcal`,
  };
  return { proteina:protG.toFixed(0)+'g', grasa:grasaG.toFixed(0)+'g', carbs:carbsG.toFixed(0)+'g', resumen:`${c} kcal keto ${n}: ${grasaG.toFixed(0)}g grasa, ${protG.toFixed(0)}g proteína, ${carbsG.toFixed(0)}g carbs.`, _insight, _chart };
}
