export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function caloriasGymPesasHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = 6 * p * (m / 60);
  const calR = Math.round(cal);
  const alfajores = cal / 230;
  return {
    kcal: cal.toFixed(0) + ' kcal',
    resumen: `${m} min gym/pesas: ${cal.toFixed(0)} kcal (${p}kg, MET 6).`,
    _insight: {
      title: 'El gasto sigue después de entrenar',
      text: `En ${m} min de pesas quemaste **${calR} kcal** (~**${alfajores.toFixed(1)} alfajores**). Más allá del número, el trabajo de fuerza eleva tu metabolismo en reposo y suma músculo, que quema calorías incluso sin entrenar.`,
      tone: 'good',
      icon: '🏋️',
    },
  };
}
