export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function caloriasBoxeoMmaHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = 10 * p * (m / 60);
  const minCaminar = Math.round(cal / 5); // ~5 kcal/min caminando
  const _insight = {
    title: 'Gasto de combate',
    text: `${m} min de boxeo/MMA queman **~${cal.toFixed(0)} kcal** para ${p} kg. Con un **MET de 10** está entre las disciplinas más intensas: equivale a unos **${minCaminar} min** de caminata. Sumá hidratación y recuperación.`,
    tone: 'good',
    icon: '🥊',
  };
  return { kcal: cal.toFixed(0) + ' kcal', resumen: `${m} min boxeo/MMA: ${cal.toFixed(0)} kcal (${p}kg, MET 10).`, _insight };
}
