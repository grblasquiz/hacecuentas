/** Suscriptores YouTube para 1000 */
export interface Inputs { suscriptoresActuales: number; suscriptoresPorDia: number; }
export interface Outputs { faltantes: number; diasEstimados: string; fechaEstimada: string; porcentaje: string; _insight?: any; _chart?: any; }

export function youtubeSuscriptoresPara1000(i: Inputs): Outputs {
  const actuales = Number(i.suscriptoresActuales) || 0;
  const porDia = Number(i.suscriptoresPorDia);
  if (porDia <= 0) throw new Error('Ingresá un ritmo de suscriptores por día válido');
  const META = 1000;
  const faltantes = Math.max(0, META - actuales);
  const dias = faltantes > 0 ? Math.ceil(faltantes / porDia) : 0;
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const fechaStr = fecha.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  const pct = Math.min(100, (actuales / META) * 100);
  const tone = faltantes === 0 ? 'good' : pct >= 50 ? 'neutral' : 'warn';
  const icon = faltantes === 0 ? '🎉' : '🚀';
  const insightText = faltantes === 0
    ? `Con **${actuales.toLocaleString('es-AR')}** suscriptores ya superaste el requisito de monetización de **1.000**. Falta sumar las 4.000 horas de visualización (o 10M de vistas en Shorts).`
    : `Te faltan **${faltantes.toLocaleString('es-AR')}** suscriptores para los 1.000. A **${porDia}/día** llegás en **${dias} días** (~${(dias/30).toFixed(1)} meses), alrededor del **${fechaStr}**. Vas por el **${pct.toFixed(1)}%** del camino.`;
  return {
    faltantes,
    diasEstimados: faltantes === 0 ? 'Ya llegaste a los 1.000' : `${dias} días (~${(dias/30).toFixed(1)} meses)`,
    fechaEstimada: faltantes === 0 ? 'Meta alcanzada' : fechaStr,
    porcentaje: `${pct.toFixed(1)}%`,
    _insight: {
      title: 'Tu camino a la monetización',
      text: insightText,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: +pct.toFixed(1),
      markerLabel: `${pct.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Arrancando', max: 25, color: '#ef4444', colorDark: '#b91c1c' },
        { nombre: 'En camino', max: 50, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Más de la mitad', max: 75, color: '#eab308', colorDark: '#a16207' },
        { nombre: 'Casi', max: 99, color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Meta', max: 101, color: '#10b981', colorDark: '#047857' },
      ],
      ariaLabel: `Progreso del ${pct.toFixed(1)}% hacia los 1.000 suscriptores`,
    },
  };
}
