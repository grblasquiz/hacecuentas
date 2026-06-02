/** CTR Thumbnail YouTube */
export interface Inputs { impresiones: number; clicks: number; }
export interface Outputs { ctr: string; benchmark: string; calificacion: string; recomendacion: string; _insight?: any; _chart?: any; }

export function youtubeCtrThumbnailPromedio(i: Inputs): Outputs {
  const imp = Number(i.impresiones);
  const clk = Number(i.clicks) || 0;
  if (imp <= 0) throw new Error('Ingresá impresiones válidas');
  if (clk > imp) throw new Error('Los clicks no pueden superar las impresiones');
  const ctr = (clk / imp) * 100;
  let calif = '', rec = '';
  if (ctr < 2) { calif = 'Muy bajo — el algoritmo frena el video'; rec = 'Rediseñá el thumbnail con cara, contraste y texto corto'; }
  else if (ctr < 4) { calif = 'Aceptable pero mejorable'; rec = 'Probá A/B test con 3 versiones usando Test & Compare'; }
  else if (ctr < 6) { calif = 'Promedio global — OK'; rec = 'Mejorá contraste y expresión facial para subir al 6-8%'; }
  else if (ctr < 10) { calif = 'Bueno'; rec = 'Mantené el estilo y replicalo en próximos videos'; }
  else { calif = 'Excelente — top 10%'; rec = 'Estás en tier top: documentá qué hizo funcionar esta miniatura'; }
  const tone = ctr < 4 ? 'warn' : ctr < 6 ? 'neutral' : 'good';
  const icon = ctr < 4 ? '⚠️' : ctr < 6 ? '🖼️' : '🔥';
  const insightText = ctr < 2
    ? `Con un CTR de **${ctr.toFixed(2)}%** sobre **${imp.toLocaleString('es-AR')}** impresiones, el algoritmo deja de ofrecer el video: menos del 2% de la gente que lo ve hace clic.`
    : ctr < 4
      ? `Tu CTR de **${ctr.toFixed(2)}%** está por debajo del promedio global (4-6%): de **${imp.toLocaleString('es-AR')}** impresiones obtuviste **${clk.toLocaleString('es-AR')}** clicks. Hay margen claro de mejora en la miniatura.`
      : ctr < 6
        ? `Tu CTR de **${ctr.toFixed(2)}%** está en el **promedio global saludable** (4-6%): **${clk.toLocaleString('es-AR')}** clicks sobre **${imp.toLocaleString('es-AR')}** impresiones.`
        : ctr < 10
          ? `Tu CTR de **${ctr.toFixed(2)}%** está por encima del promedio: la miniatura convierte bien (**${clk.toLocaleString('es-AR')}** de **${imp.toLocaleString('es-AR')}** impresiones).`
          : `CTR de **${ctr.toFixed(2)}%** — estás en el **top 10% de YouTube**. Esta miniatura es un patrón a replicar.`;
  return {
    ctr: `${ctr.toFixed(2)}%`,
    benchmark: 'Rango saludable YouTube: 4-10% (promedio global 4-6%)',
    calificacion: calif,
    recomendacion: rec,
    _insight: {
      title: 'Qué dice tu CTR',
      text: insightText,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: +ctr.toFixed(2),
      markerLabel: `${ctr.toFixed(2)}%`,
      min: 0,
      segments: [
        { nombre: 'Muy bajo', max: 2, color: '#ef4444', colorDark: '#b91c1c' },
        { nombre: 'Mejorable', max: 4, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Promedio', max: 6, color: '#eab308', colorDark: '#a16207' },
        { nombre: 'Bueno', max: 10, color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Top 10%', max: Math.max(15, Math.ceil(ctr) + 1), color: '#10b981', colorDark: '#047857' },
      ],
      ariaLabel: `CTR de ${ctr.toFixed(2)}% ubicado en la escala de benchmarks de YouTube`,
    },
  };
}
