/** Horas para preparar GRE */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  horasVerbal: number;
  horasQuant: number;
  meses: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function horasPrepararGre(i: Inputs): Outputs {
  const vA = Number(i.verbalActual) || 150;
  const vO = Number(i.verbalObjetivo) || 160;
  const qA = Number(i.quantActual) || 155;
  const qO = Number(i.quantObjetivo) || 165;
  const hsem = Number(i.horasSemana) || 10;
  if (vO < vA || qO < qA) throw new Error('Objetivos deben ser >= actuales');

  const hxpVerbal = (actual: number) => actual < 150 ? 8 : actual < 155 ? 10 : actual < 160 ? 13 : actual < 165 ? 16 : 20;
  const hxpQuant = (actual: number) => actual < 150 ? 7 : actual < 155 ? 9 : actual < 160 ? 11 : actual < 165 ? 14 : 18;

  const horasVerbal = (vO - vA) * hxpVerbal(vA);
  const horasQuant = (qO - qA) * hxpQuant(qA);
  const total = horasVerbal + horasQuant;
  const meses = Math.round(total / hsem / 4.33 * 10) / 10;

  let rec = '';
  const totObj = vO + qO;
  if (totObj >= 330) rec = 'Score elite. Necesitarás feedback profesional y 250+ h.';
  else if (totObj >= 320) rec = 'Top 50 universities. 6+ meses recomendado.';
  else if (totObj >= 310) rec = 'Mid-tier programs. 3-5 meses sostenidos.';
  else rec = 'State programs alcanzables con 2-3 meses.';

  const tone: 'good' | 'warn' | 'neutral' = meses > 6 ? 'warn' : meses < 3 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tu plan de estudio para el GRE',
    text: `Subir de **${vA}→${vO}** en Verbal y **${qA}→${qO}** en Quant pide unas **${Math.round(total)} h** de estudio (${Math.round(horasVerbal)} h Verbal + ${Math.round(horasQuant)} h Quant). A **${hsem} h/semana** son ~**${meses} meses**. ${rec}`,
    tone,
    icon: '📚',
  };

  const slices = [
    { label: 'Verbal', value: Math.round(horasVerbal) },
    { label: 'Quant', value: Math.round(horasQuant) },
  ].filter(s => s.value > 0);

  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    centerValue: `${Math.round(total)} h`,
    centerLabel: 'Total estudio',
    ariaLabel: `Gráfico de torta de las horas de estudio para el GRE: ${Math.round(horasVerbal)} h de Verbal y ${Math.round(horasQuant)} h de Quant, total ${Math.round(total)} h`,
  } : undefined;

  const out: Outputs = {
    horasTotales: Math.round(total),
    horasVerbal: Math.round(horasVerbal),
    horasQuant: Math.round(horasQuant),
    meses,
    recomendacion: rec,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;

}
