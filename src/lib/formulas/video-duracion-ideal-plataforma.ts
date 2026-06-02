/** Calculadora de Duración Ideal de Video */
export interface Inputs { plataforma: string; objetivo: string; }
export interface Outputs { duracionIdeal: string; duracionMaxima: string; retencionPromedio: number; tips: string; _insight?: any; _chart?: any; }

const DATA: Record<string, Record<string, { ideal: string; max: string; retencion: number; tips: string }>> = {
  tiktok: {
    engagement: { ideal: '15-30 segundos', max: '10 minutos', retencion: 65, tips: 'Hook en los primeros 2 seg. Videos cortos con loop funcionan mejor.' },
    educativo: { ideal: '30-60 segundos', max: '10 minutos', retencion: 55, tips: 'Usá texto en pantalla y explicá rápido. La gente scrollea si no enganchás en 3 seg.' },
    ventas: { ideal: '15-30 segundos', max: '10 minutos', retencion: 50, tips: 'Mostrá el producto en uso inmediatamente. CTA claro al final.' },
    brand: { ideal: '30-60 segundos', max: '10 minutos', retencion: 45, tips: 'Storytelling visual, tendencias y sonidos populares.' },
  },
  reels: {
    engagement: { ideal: '15-30 segundos', max: '90 segundos', retencion: 60, tips: 'Optimizá para replay. Reels que dan ganas de verlos de nuevo tienen más alcance.' },
    educativo: { ideal: '30-60 segundos', max: '90 segundos', retencion: 50, tips: 'Carruseles pueden funcionar mejor que Reels para contenido educativo largo.' },
    ventas: { ideal: '15-30 segundos', max: '90 segundos', retencion: 45, tips: 'Mostrá el antes/después. Usá stickers de producto si tenés shop.' },
    brand: { ideal: '30-60 segundos', max: '90 segundos', retencion: 50, tips: 'Estética consistente con tu feed. Audio trending sube el alcance.' },
  },
  youtube: {
    engagement: { ideal: '8-12 minutos', max: 'Sin límite práctico', retencion: 50, tips: 'Videos de 8+ min permiten mid-roll ads. Optimizá thumbnail y título.' },
    educativo: { ideal: '10-20 minutos', max: 'Sin límite práctico', retencion: 45, tips: 'Capítulos y timestamps mejoran retención. Entregá valor desde el minuto 1.' },
    ventas: { ideal: '5-8 minutos', max: 'Sin límite práctico', retencion: 40, tips: 'Review honesto + link en descripción. Demasiado largo pierde la venta.' },
    brand: { ideal: '3-5 minutos', max: 'Sin límite práctico', retencion: 55, tips: 'Storytelling cinematográfico. Calidad > cantidad en YouTube.' },
  },
  youtube_shorts: {
    engagement: { ideal: '30-45 segundos', max: '60 segundos', retencion: 70, tips: 'Vertical, hook inmediato, sin intro larga.' },
    educativo: { ideal: '45-60 segundos', max: '60 segundos', retencion: 60, tips: 'Un tip rápido por Short. Serie de Shorts para temas largos.' },
    ventas: { ideal: '15-30 segundos', max: '60 segundos', retencion: 55, tips: 'Producto en acción desde el segundo 1.' },
    brand: { ideal: '30-45 segundos', max: '60 segundos', retencion: 60, tips: 'Behind the scenes y contenido informal.' },
  },
  linkedin: {
    engagement: { ideal: '30-90 segundos', max: '10 minutos', retencion: 45, tips: 'Tono profesional pero humano. Subtítulos obligatorios (80% sin sonido).' },
    educativo: { ideal: '2-5 minutos', max: '10 minutos', retencion: 40, tips: 'Datos y estadísticas. El contenido de valor se comparte mucho en LinkedIn.' },
    ventas: { ideal: '30-60 segundos', max: '10 minutos', retencion: 35, tips: 'Case study en video. Resultados concretos > promesas.' },
    brand: { ideal: '1-3 minutos', max: '10 minutos', retencion: 40, tips: 'Cultura de empresa, team highlights, thought leadership.' },
  },
  twitter: {
    engagement: { ideal: '15-45 segundos', max: '140 segundos', retencion: 50, tips: 'Autoplay sin sonido — asegurate que se entienda visualmente.' },
    educativo: { ideal: '30-60 segundos', max: '140 segundos', retencion: 40, tips: 'Hilos con video embebido funcionan muy bien.' },
    ventas: { ideal: '15-30 segundos', max: '140 segundos', retencion: 35, tips: 'Directo al punto. Twitter es rápido, no hagas perder tiempo.' },
    brand: { ideal: '30-60 segundos', max: '140 segundos', retencion: 45, tips: 'Memes en video y contenido trending.' },
  },
};

export function videoDuracionIdealPlataforma(i: Inputs): Outputs {
  const plat = String(i.plataforma);
  const obj = String(i.objetivo);
  const d = DATA[plat]?.[obj];
  if (!d) throw new Error('Seleccioná plataforma y objetivo');
  const ret = Number(d.retencion);

  const tone = ret >= 60 ? 'good' : ret >= 45 ? 'neutral' : 'warn';
  const lectura = ret >= 60 ? 'es una retención alta: el formato corto trabaja a tu favor.' : ret >= 45 ? 'es una retención típica: respetá la duración ideal para no perder audiencia.' : 'es una retención exigente: cada segundo de más penaliza, andá al grano.';
  const _insight = {
    title: 'Apuntá a la duración ideal',
    text: `Para este objetivo en esta plataforma, la duración que mejor funciona es **${d.ideal}** y la retención promedio ronda el **${ret}%** — ${lectura}`,
    tone,
    icon: '🎬',
  };

  const _chart = {
    type: 'scale',
    marker: ret,
    markerLabel: `${ret}% retención`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 45, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: 'Media', max: 60, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Alta', max: 100, color: '#34d399', colorDark: '#047857' },
    ],
    ariaLabel: `Retención promedio de ${ret}% sobre 100`,
  };

  return { duracionIdeal: d.ideal, duracionMaxima: d.max, retencionPromedio: ret, tips: d.tips, _insight, _chart };
}
