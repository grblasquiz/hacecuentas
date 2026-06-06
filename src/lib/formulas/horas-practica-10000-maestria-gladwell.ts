export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasPractica10000MaestriaGladwell(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const hoursPerWeek = Math.max(Number(i.v1) || 0, 0.1);
  const weeksPerYear = Math.max(Number(i.v2) || 50, 1);
  const annualHours = hoursPerWeek * weeksPerYear;
  const yearsToMastery = 10000 / annualHours;
  const resumen = __lang === 'en'
    ? `At ${hoursPerWeek} hrs/week × ${weeksPerYear} weeks/year = ${annualHours.toFixed(0)} hrs/year → ${yearsToMastery.toFixed(1)} years to reach 10,000 hours.`
    : `A ${hoursPerWeek} hrs/semana × ${weeksPerYear} semanas/año = ${annualHours.toFixed(0)} hrs/año → ${yearsToMastery.toFixed(1)} años para llegar a 10.000 horas.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Your mastery timeline',
        text: `At your pace you reach **10,000 hours in ${yearsToMastery.toFixed(1)} years** (${annualHours.toFixed(0)} deliberate hours/year). Remember: Ericsson's research emphasizes **deliberate practice** — focused, goal-directed, with immediate feedback — not just passive repetition.`,
        tone: 'neutral' as const,
        icon: '🎯',
      }
    : {
        title: 'Tu cronograma hacia la maestría',
        text: `A tu ritmo llegás a **10.000 horas en ${yearsToMastery.toFixed(1)} años** (${annualHours.toFixed(0)} horas deliberadas/año). Recordá: la investigación de Ericsson enfatiza la **práctica deliberada** — enfocada, con objetivos claros y feedback inmediato.`,
        tone: 'neutral' as const,
        icon: '🎯',
      };
  return { resultado: yearsToMastery.toFixed(1), resumen, _insight };
}
