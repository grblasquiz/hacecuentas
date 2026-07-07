export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function rpeRirSeriesEntrenamientoPorcentaje(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.repeticiones)||0; const rpe=Number(i.rpe)||8;
  const rir=10-rpe;
  const pctMap:Record<string,number>={'1_10':100,'1_9':96,'2_10':95,'2_9':92,'3_10':92,'3_9':89,'5_10':87,'5_9':84,'5_8':81,'8_10':80,'8_8':74,'10_9':71,'10_8':68};
  const key=`${r}_${rpe}`; const pct=pctMap[key]||(rpe/10*100-r*2);
  const rirLabel = __lang === 'en' ? `${rir} (reps in reserve)` : `${rir} (reps en reserva)`;
  const pctR = Math.round(pct);
  const interpretacion = __lang === 'en'
    ? `${r} reps @ RPE ${rpe}: you had ${rir} reps left, ~${pctR}% of your 1RM.`
    : `${r} reps @ RPE ${rpe}: te quedaban ${rir} reps, ~${pctR}% de tu 1RM.`;

  const zona = pct < 70 ? (__lang === 'en' ? 'endurance' : 'resistencia')
    : pct < 85 ? (__lang === 'en' ? 'hypertrophy' : 'hipertrofia')
    : pct < 95 ? (__lang === 'en' ? 'strength' : 'fuerza')
    : (__lang === 'en' ? 'max strength' : 'fuerza máxima');
  const insight = {
    title: __lang === 'en' ? 'Training intensity' : 'Intensidad del entrenamiento',
    text: __lang === 'en'
      ? `At RPE ${rpe} with ${rir} rep${rir === 1 ? '' : 's'} in reserve you trained at **~${pctR}% of 1RM**, the **${zona}** zone. To progress, keep RIR ${rir === 0 ? 'above 0 on most sets' : 'where it is and add load over weeks'}.`
      : `Con RPE ${rpe} y ${rir} rep${rir === 1 ? '' : 's'} en reserva entrenaste al **~${pctR}% del 1RM**, zona de **${zona}**. Para progresar, ${rir === 0 ? 'dejá al menos 1 rep en reserva en la mayoría de las series' : 'mantené ese RIR y subí carga semana a semana'}.`,
    tone: rir === 0 ? 'warn' : 'good',
    icon: '🏋️',
  };

  const chart = {
    type: 'scale' as const,
    marker: pctR,
    markerLabel: `~${pctR}% 1RM`,
    min: 50,
    unit: '%',
    segments: __lang === 'en'
      ? [
          { nombre: 'Endurance', max: 70, color: '#bfdbfe', colorDark: '#1d4ed8' },
          { nombre: 'Hypertrophy', max: 85, color: '#bbf7d0', colorDark: '#166534' },
          { nombre: 'Strength', max: 95, color: '#fed7aa', colorDark: '#9a3412' },
          { nombre: 'Max', max: Math.max(100, pctR + 1), color: '#fecaca', colorDark: '#b91c1c' },
        ]
      : [
          { nombre: 'Resistencia', max: 70, color: '#bfdbfe', colorDark: '#1d4ed8' },
          { nombre: 'Hipertrofia', max: 85, color: '#bbf7d0', colorDark: '#166534' },
          { nombre: 'Fuerza', max: 95, color: '#fed7aa', colorDark: '#9a3412' },
          { nombre: 'Máxima', max: Math.max(100, pctR + 1), color: '#fecaca', colorDark: '#b91c1c' },
        ],
    ariaLabel: __lang === 'en'
      ? 'Scale of % of 1RM by training zone: endurance, hypertrophy, strength, max.'
      : 'Escala de % del 1RM por zona de entrenamiento: resistencia, hipertrofia, fuerza, máxima.',
  };

  return { rir: rirLabel, porcentaje1rm:`~${pctR}%`, interpretacion, _insight: insight, _chart: chart };
}
