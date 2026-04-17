/** CTR Thumbnail YouTube */
export interface Inputs { impresiones: number; clicks: number; }
export interface Outputs { ctr: string; benchmark: string; calificacion: string; recomendacion: string; }

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
  return {
    ctr: `${ctr.toFixed(2)}%`,
    benchmark: 'Rango saludable YouTube: 4-10% (promedio global 4-6%)',
    calificacion: calif,
    recomendacion: rec,
  };
}
