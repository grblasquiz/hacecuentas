export interface Inputs { [k: string]: number | string; }
export interface Outputs { kcal: string; resumen: string; _insight?: any; }
export function caloriasSurfKitesurfHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = 6 * p * (m / 60);
  const horas = m / 60;
  const insight = {
    title: 'Tu sesión en el agua',
    text: `**${m} min** de surf o kitesurf con **${p} kg** queman **${cal.toFixed(0)} kcal** (MET 6, ~${(6 * p).toFixed(0)} kcal/hora).` +
      (horas >= 2
        ? ' Sesiones largas como esta convierten un día de olas en un entreno completo de cuerpo entero.'
        : ' Entre remadas, equilibrio y arranque, el gasto real suele ser aún mayor en mar movido.'),
    tone: 'good',
    icon: '🏄',
  };
  return { kcal: cal.toFixed(0) + ' kcal', resumen: `${m} min surf/kitesurf: ${cal.toFixed(0)} kcal (${p}kg, MET 6).`, _insight: insight };
}
