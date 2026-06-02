export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function proyeccion21kDesde10kCameron(i: Inputs): Outputs {
  const t = Number(i.t10kMin) || 0;
  const t2 = t * Math.pow(2.11, 1.06);
  const h = Math.floor(t2 / 60); const m = Math.round(t2 % 60);

  // Ritmo proyectado por km para el medio maratón (t2 está en minutos; 21,1 km)
  const paceMinDec = t2 / 21.1;
  const paceMin = Math.floor(paceMinDec);
  const paceS = Math.round((paceMinDec - paceMin) * 60);
  const paceStr = `${paceMin}:${String(paceS).padStart(2, '0')}`;

  const _insight = t > 0 ? {
    title: 'Tu media maratón proyectada',
    text: `Partiendo de un 10K en **${t} min**, la fórmula de Cameron proyecta un **21K en ${h}h${String(m).padStart(2, '0')}**, a un ritmo de **${paceStr} min/km**. Sirve como objetivo de referencia: para sostenerlo el día de la carrera necesitás fondos largos y una buena estrategia de hidratación y nutrición.`,
    tone: 'neutral',
    icon: '🏅',
  } : undefined;

  return { proy21k: `${h}:${String(m).padStart(2,'0')}`, resumen: `21K proyectado desde ${t}min 10K: ${h}h${String(m).padStart(2,'0')}.`, ...(_insight ? { _insight } : {}) };
}
