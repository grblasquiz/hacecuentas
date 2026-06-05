export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function caloriasGymPesasHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70;
  const m = Number(i.minutos) || 60;
  // MET según intensidad (Compendium of Physical Activities, Ainsworth et al. 2011)
  const intensidad = String(i.intensidad || 'moderado');
  const metMap: Record<string, number> = {
    liviano: 3,      // gym general, descansos largos, pesas livianas
    moderado: 5,     // hipertrofia 3-4 series, descansos normales
    intenso: 6,      // supersets, poco descanso
    crossfit: 8,     // CrossFit / HIIT funcional
  };
  const met = metMap[intensidad] ?? 5;
  const horas = m / 60;
  const cal = met * p * horas;
  const calR = Math.round(cal);
  const alfajores = cal / 230;

  const labelMap: Record<string, string> = {
    liviano: 'Pesas livianas (MET 3)',
    moderado: 'Pesas moderadas (MET 5)',
    intenso: 'Pesas intensas (MET 6)',
    crossfit: 'CrossFit/HIIT (MET 8)',
  };
  const label = labelMap[intensidad] ?? labelMap['moderado'];

  return {
    kcal: calR + ' kcal',
    resumen: `${m} min de ${label}: ${calR} kcal (${p} kg, MET ${met}).`,
    _insight: {
      title: 'El gasto sigue después de entrenar',
      text: `En ${m} min de pesas quemaste **${calR} kcal** (~**${alfajores.toFixed(1)} alfajores**). El EPOC post-pesas suma 6-15% adicional durante 24-48h, y cada kg de músculo ganado quema ~60 kcal/día extra en reposo.`,
      tone: 'good',
      icon: '🏋️',
    },
  };
}
