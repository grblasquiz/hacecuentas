/** Carrousel Instagram Slides */
export interface Inputs { objetivo: string; tipoContenido: string; }
export interface Outputs { slidesOptimas: string; rangoAceptable: string; estructura: string; tip: string; _insight?: any; }

export function instagramCarrouselSlidesOptimas(i: Inputs): Outputs {
  const obj = String(i.objetivo);
  const tipo = String(i.tipoContenido);
  if (!obj || !tipo) throw new Error('Seleccioná objetivo y tipo');
  const baseByObj: Record<string, [number, number]> = {
    'Reach / descubrimiento': [3, 5],
    'Saves (contenido educativo)': [5, 7],
    'Engagement (likes, comentarios)': [7, 10],
    'Venta / conversión': [3, 5],
    'Storytelling / narrativa': [8, 10],
  };
  const adjByTipo: Record<string, number> = {
    'Tutorial paso a paso': 1,
    'Lista / tips': 0,
    'Antes vs después': -2,
    'Storytelling visual': 2,
    'Producto / ecommerce': -1,
    'Infografía': 1,
  };
  const [mn, mx] = baseByObj[obj] || [5, 7];
  const adj = adjByTipo[tipo] || 0;
  const mnF = Math.max(3, mn + adj);
  const mxF = Math.min(10, mx + adj);
  const opt = Math.round((mnF + mxF) / 2);
  const _insight = {
    title: `${opt} slides es tu punto óptimo`,
    text: `Para "${obj}" con formato "${tipo}", apuntá a **${opt} slides** (rango sano: ${mnF}-${mxF}). Pocas slides limitan el dwell time; demasiadas hacen que la gente abandone antes del CTA.`,
    tone: 'neutral',
    icon: '🎠',
  };
  return {
    slidesOptimas: `${opt} slides`,
    rangoAceptable: `${mnF}-${mxF} slides`,
    estructura: 'Slide 1 hook → 2-${opt-1} valor → ${opt} CTA (guardá / seguime)'.replace('${opt-1}', String(opt-1)).replace('${opt}', String(opt)),
    tip: 'Slide 2 es el gateway: si supera esta, la gente suele llegar al final',
    _insight,
  };
}
