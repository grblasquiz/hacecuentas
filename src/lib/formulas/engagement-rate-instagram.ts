/** Calculadora de Engagement Rate Instagram */
export interface Inputs { seguidores: number; likes: number; comentarios: number; shares?: number; }
export interface Outputs { engagementRate: number; interaccionesTotal: number; calificacion: string; benchmark: string; _insight?: any; _chart?: any; }

export function engagementRateInstagram(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const likes = Number(i.likes) || 0;
  const com = Number(i.comentarios) || 0;
  const shares = i.shares ? Number(i.shares) : 0;
  if (!seg || seg <= 0) throw new Error('Ingresá la cantidad de seguidores');

  const total = likes + com + shares;
  const er = (total / seg) * 100;

  let calificacion: string;
  if (er < 1) calificacion = 'Bajo — tu contenido no está generando suficiente interacción.';
  else if (er < 3) calificacion = 'Promedio — estás en el rango normal para Instagram.';
  else if (er < 6) calificacion = 'Bueno — tu audiencia está comprometida con tu contenido.';
  else calificacion = 'Excelente — engagement muy por encima del promedio, gran comunidad.';

  let benchmark: string;
  if (seg < 1000) benchmark = 'Nano-influencer (<1K): promedio 5-8%. Tu ER: ' + er.toFixed(1) + '%.';
  else if (seg < 10000) benchmark = 'Micro-influencer (1K-10K): promedio 3-5%. Tu ER: ' + er.toFixed(1) + '%.';
  else if (seg < 100000) benchmark = 'Influencer medio (10K-100K): promedio 1.5-3%. Tu ER: ' + er.toFixed(1) + '%.';
  else if (seg < 1000000) benchmark = 'Macro-influencer (100K-1M): promedio 1-2%. Tu ER: ' + er.toFixed(1) + '%.';
  else benchmark = 'Mega-influencer (+1M): promedio 0.5-1.5%. Tu ER: ' + er.toFixed(1) + '%.';

  const tone = er < 1 ? 'warn' : er < 3 ? 'neutral' : 'good';
  const label = er < 1 ? 'bajo' : er < 3 ? 'promedio' : er < 6 ? 'bueno' : 'excelente';
  const _insight = {
    title: 'Tu engagement rate',
    text: `Con **${total.toLocaleString('es-AR')}** interacciones sobre **${seg.toLocaleString('es-AR')}** seguidores, tu ER es **${er.toFixed(2)}%** — nivel **${label}** para Instagram.`,
    tone,
    icon: '📸',
  };

  const _chart = {
    type: 'scale',
    marker: Number(er.toFixed(2)),
    markerLabel: er.toFixed(2) + '%',
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 1, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Promedio', max: 3, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 6, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Excelente', max: Math.max(10, Math.ceil(er) + 1), color: '#10b981', colorDark: '#047857' },
    ],
    ariaLabel: `Engagement rate de ${er.toFixed(2)}% ubicado en la zona ${label}`,
  };

  return {
    engagementRate: Number(er.toFixed(2)),
    interaccionesTotal: total,
    calificacion,
    benchmark,
    _insight,
    _chart,
  };
}
