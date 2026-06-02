/** Horas para preparar SAT */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  semanas: number;
  meses: number;
  factibilidad: string;
  _insight?: any;
  _chart?: any;
}

export function horasPrepararSat(i: Inputs): Outputs {
  const ac = Number(i.scoreActual) || 1200;
  const obj = Number(i.scoreObjetivo) || 1500;
  const hsem = Number(i.horasSemana) || 10;
  if (obj <= ac) throw new Error('Objetivo debe ser mayor que actual');
  if (ac < 400 || obj > 1600) throw new Error('Score entre 400-1600');

  const gap = obj - ac;
  // Curva: horas/punto crece con score alto
  let hxp = 0.4; // base
  if (obj > 1400) hxp = 0.6;
  if (obj > 1500) hxp = 0.8;
  if (obj > 1550) hxp = 1.0;

  let horas = gap * hxp;
  // Extra si parten muy bajo
  if (ac < 1000) horas *= 1.3;

  const sem = horas / hsem;
  const meses = Math.round(sem / 4.33 * 10) / 10;

  let fact = '';
  if (meses < 1) fact = 'Plazo agresivo — rindás full-time.';
  else if (meses < 3) fact = 'Plazo realista con disciplina.';
  else if (meses < 6) fact = 'Plan sostenible.';
  else fact = 'Plan largo — considerá reducir horas/sem o objetivo intermedio.';

  const tone: 'good' | 'warn' | 'neutral' = (meses < 1 || meses >= 6) ? 'warn' : meses < 3 ? 'good' : 'neutral';
  const _insight = {
    title: 'Cuánto necesitás para tu objetivo SAT',
    text: `Subir **${gap} puntos** (de ${ac} a ${obj}) pide unas **${Math.round(horas)} h** de estudio. A **${hsem} h/semana** son ~**${Math.round(sem)} semanas** (${meses} meses). ${fact}`,
    tone,
    icon: '📝',
  };

  const topMax = Math.max(8, Math.ceil(meses) + 1);
  const _chart = {
    type: 'scale',
    marker: meses,
    markerLabel: 'Tu plan',
    min: 0,
    segments: [
      { nombre: 'Agresivo', max: 1, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Realista', max: 3, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Sostenible', max: 6, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: 'Largo', max: topMax, color: '#eab308', colorDark: '#facc15' },
    ],
    ariaLabel: `Tu plan de estudio para el SAT dura ${meses} meses, en la zona de factibilidad correspondiente`,
  };

  return {
    horasTotales: Math.round(horas),
    semanas: Math.round(sem),
    meses,
    factibilidad: fact,
    _insight,
    _chart,
  };

}
