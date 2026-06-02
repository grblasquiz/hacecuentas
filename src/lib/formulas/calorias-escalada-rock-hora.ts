export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function caloriasEscaladaRockHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = 9 * p * (m / 60);
  const calR = Math.round(cal);
  const alfajores = cal / 230;
  return {
    kcal: cal.toFixed(0) + ' kcal',
    resumen: `${m} min escalada en roca: ${cal.toFixed(0)} kcal (${p}kg, MET 9).`,
    _insight: {
      title: 'Uno de los deportes que más quema',
      text: `La escalada en roca (MET 9) es de alto gasto: en ${m} min te llevaste **${calR} kcal**, equivalente a casi **${alfajores.toFixed(1)} alfajores**. Trabajás fuerza de tren superior, core y cardio a la vez.`,
      tone: 'good',
      icon: '🧗',
    },
  };
}
