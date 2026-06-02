/** Retention Rate YouTube */
export interface Inputs { duracionPromedio: number; duracionTotal: number; }
export interface Outputs { retentionRate: string; benchmark: string; calificacion: string; segundosAbandonoPromedio: string; _insight?: any; _chart?: any; }

export function youtubeRetentionRateBenchmark(i: Inputs): Outputs {
  const avd = Number(i.duracionPromedio);
  const total = Number(i.duracionTotal);
  if (avd <= 0 || total <= 0) throw new Error('Ingresá duraciones válidas');
  if (avd > total) throw new Error('La duración vista no puede superar la total');
  const rr = (avd / total) * 100;
  let bench = 40;
  if (total < 3) bench = 55;
  else if (total < 5) bench = 50;
  else if (total < 10) bench = 40;
  else if (total < 20) bench = 35;
  else if (total < 30) bench = 30;
  else bench = 25;
  let calif = '';
  if (rr < bench * 0.7) calif = 'Bajo — el algoritmo te está castigando';
  else if (rr < bench) calif = 'Aceptable — por debajo del benchmark';
  else if (rr < bench * 1.25) calif = 'Bueno — estás en el promedio alto';
  else calif = 'Excelente — el algoritmo te va a empujar';
  const tone = rr < bench ? 'warn' : 'good';
  const icon = rr < bench ? '⚠️' : '📈';
  const insightText = rr < bench * 0.7
    ? `Retención de **${rr.toFixed(1)}%** contra un benchmark de **${bench}%** para videos de ~${total.toFixed(1)} min: estás muy por debajo y el algoritmo frena la distribución. El espectador promedio abandona al minuto **${avd.toFixed(1)}**.`
    : rr < bench
      ? `Tu **${rr.toFixed(1)}%** está apenas por debajo del benchmark de **${bench}%** para videos de ~${total.toFixed(1)} min. Reforzá el primer minuto: el promedio abandona al minuto **${avd.toFixed(1)}**.`
      : rr < bench * 1.25
        ? `Tu **${rr.toFixed(1)}%** supera el benchmark de **${bench}%** para videos de ~${total.toFixed(1)} min. Estás en el promedio alto: el algoritmo te acompaña.`
        : `Retención de **${rr.toFixed(1)}%** muy por encima del benchmark de **${bench}%**: YouTube va a empujar este video. Documentá qué hizo que la gente se quede.`;
  return {
    retentionRate: `${rr.toFixed(1)}%`,
    benchmark: `Benchmark para videos de ${total.toFixed(1)} min: ${bench}%`,
    calificacion: calif,
    segundosAbandonoPromedio: `El espectador promedio abandona al minuto ${avd.toFixed(1)}`,
    _insight: {
      title: 'Tu retención vs el benchmark',
      text: insightText,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: +rr.toFixed(1),
      markerLabel: `${rr.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: +(bench * 0.7).toFixed(1), color: '#ef4444', colorDark: '#b91c1c' },
        { nombre: 'Aceptable', max: bench, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Bueno', max: +(bench * 1.25).toFixed(1), color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Excelente', max: Math.max(100, Math.ceil(rr) + 1), color: '#10b981', colorDark: '#047857' },
      ],
      ariaLabel: `Retención de ${rr.toFixed(1)}% sobre un benchmark de ${bench}% según la duración del video`,
    },
  };
}
