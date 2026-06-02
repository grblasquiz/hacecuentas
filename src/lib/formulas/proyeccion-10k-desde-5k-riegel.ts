export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function proyeccion10kDesde5kRiegel(i: Inputs): Outputs {
  const min = Number(i.t5kMin) || 0; const s = Number(i.t5kSeg) || 0;
  const t1 = min * 60 + s;
  const t2 = t1 * Math.pow(2, 1.06);
  const m = Math.floor(t2 / 60); const ss = Math.round(t2 % 60);

  // Ritmo proyectado por km para el 10K (segundos/km)
  const paceSec = t2 / 10;
  const paceMin = Math.floor(paceSec / 60);
  const paceS = Math.round(paceSec % 60);
  const paceStr = `${paceMin}:${String(paceS).padStart(2, '0')}`;

  const _insight = t1 > 0 ? {
    title: 'Tu 10K proyectado',
    text: `Con un 5K de **${min}:${String(s).padStart(2, '0')}**, la fórmula de Riegel proyecta un **10K en ${m}:${String(ss).padStart(2, '0')}**, a un ritmo de **${paceStr} min/km**. Es una estimación realista solo si mantenés el volumen de entrenamiento; duplicar la distancia siempre cuesta un poco más por km.`,
    tone: 'neutral',
    icon: '🏃',
  } : undefined;

  return { proy10k: `${m}:${String(ss).padStart(2,'0')}`, resumen: `10K proyectado desde ${min}:${String(s).padStart(2,'0')} 5K → ${m}:${String(ss).padStart(2,'0')}.`, ...(_insight ? { _insight } : {}) };
}
