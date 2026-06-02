export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function caloriasEmbarazoExtraTrimestre(i: Inputs): Outputs {
  const t=String(i.trimestre||'1'); const b=Number(i.caloriasBase)||2000;
  const extra: Record<string,number> = { '1':0, '2':340, '3':450, lact:500 };
  const e=extra[t]||0;
  const totalKcal = b + e;

  const etapaNombre: Record<string,string> = { '1':'el primer trimestre', '2':'el segundo trimestre', '3':'el tercer trimestre', lact:'la lactancia' };
  const etapaTxt = etapaNombre[t] || `el trimestre ${t}`;
  const fmt = new Intl.NumberFormat('es-AR');

  const out: Outputs = {
    extra:`+${e} kcal`,
    total:totalKcal+' kcal',
    resumen:`${t} trimestre: +${e} kcal = ${totalKcal} kcal/día total.`,
    _insight: {
      title: 'Energía extra recomendada',
      text: e === 0
        ? `Durante ${etapaTxt} la recomendación (ACOG) es **mantener tu ingesta habitual** de **${fmt.format(b)} kcal/día**: el requerimiento extra recién aparece desde el segundo trimestre.`
        : `Para ${etapaTxt} se suman **+${e} kcal/día** sobre tu base, llegando a **${fmt.format(totalKcal)} kcal/día**. Ese plus equivale a un snack nutritivo, no a "comer por dos".`,
      tone: 'neutral',
      icon: '🤰',
    },
  };

  // Donut sólo si hay composición real (base + extra)
  if (e > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Base habitual', value: b },
        { label: 'Extra del embarazo', value: e },
      ],
      prefix: '',
      centerValue: fmt.format(totalKcal),
      centerLabel: 'kcal/día',
      ariaLabel: `Total de ${fmt.format(totalKcal)} kcal diarias compuesto por ${fmt.format(b)} de base y ${e} extra`,
    };
  }

  return out;
}
