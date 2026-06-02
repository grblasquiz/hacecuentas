/** Calendario YouTube */
export interface Inputs { horasDisponibles: number; horasPorVideo: number; }
export interface Outputs { videosPorSemana: string; videosPor3Meses: number; videosPor12Meses: number; recomendacion: string; _insight?: any; _chart?: any; }

export function youtubeCalendarioPublicacion(i: Inputs): Outputs {
  const horas = Number(i.horasDisponibles);
  const hv = Number(i.horasPorVideo);
  if (horas <= 0 || hv <= 0) throw new Error('Ingresá valores válidos');
  const vpw = horas / hv;
  const v3m = Math.round(vpw * 13);
  const v12m = Math.round(vpw * 52);
  let rec = '';
  if (vpw < 0.25) rec = 'Ritmo muy bajo — el algoritmo te va a olvidar. Considerá Shorts en su lugar.';
  else if (vpw < 1) rec = `Ritmo de ${Math.round(vpw*4)} videos/mes. Recomendable sumar Shorts para compensar.`;
  else if (vpw <= 2) rec = 'Sweet spot — 1-2 videos/semana es el óptimo global.';
  else if (vpw <= 4) rec = 'Alto volumen — cuidá calidad, el algoritmo prefiere consistencia a cantidad.';
  else rec = 'Muy alto — probable caída de calidad. Bajá a 3/semana y subí producción.';
  const enSweet = vpw >= 1 && vpw <= 2;
  const insightTone = vpw < 0.25 ? 'warn' : enSweet ? 'good' : 'neutral';
  const insightText = vpw < 0.25
    ? `A **${vpw.toFixed(2)} videos/semana** el algoritmo te va a olvidar. Con ${horas} h y ${hv} h por video, te conviene migrar a **Shorts** para sostener frecuencia.`
    : enSweet
    ? `**${vpw.toFixed(2)} videos/semana** (~${Math.round(vpw*4)}/mes) es el **sweet spot**: lo óptimo global. En 12 meses publicás **${v12m} videos** manteniendo calidad.`
    : `Tu ritmo es de **${vpw.toFixed(2)} videos/semana** (~${Math.round(vpw*4)}/mes), o **${v12m} videos al año**. ${vpw > 2 ? 'Mucho volumen: cuidá que la calidad no caiga, el algoritmo premia consistencia.' : 'Por debajo del óptimo: sumá Shorts para compensar la frecuencia.'}`;

  // Gauge sobre videos/semana, zonas alineadas a la recomendación.
  const segMax = Math.max(7, Math.ceil(vpw + 1));
  const chart = {
    type: 'scale',
    marker: Number(vpw.toFixed(2)),
    markerLabel: `${vpw.toFixed(1)}/sem`,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: 0.25, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Bajo', max: 1, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Sweet spot', max: 2, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Alto', max: 4, color: '#3b82f6', colorDark: '#2563eb' },
      { nombre: 'Excesivo', max: segMax, color: '#8b5cf6', colorDark: '#7c3aed' },
    ],
    ariaLabel: `Ritmo de ${vpw.toFixed(1)} videos por semana ubicado en la escala de frecuencia de publicación en YouTube`,
  };

  return {
    videosPorSemana: `${vpw.toFixed(2)} videos/semana (~${Math.round(vpw*4)}/mes)`,
    videosPor3Meses: v3m,
    videosPor12Meses: v12m,
    recomendacion: rec,
    _insight: {
      title: 'Tu ritmo de publicación',
      text: insightText,
      tone: insightTone,
      icon: '🎬',
    },
    _chart: chart,
  };
}
