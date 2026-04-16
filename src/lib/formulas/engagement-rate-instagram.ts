/** Calculadora de Engagement Rate Instagram */
export interface Inputs { seguidores: number; likes: number; comentarios: number; shares?: number; }
export interface Outputs { engagementRate: number; interaccionesTotal: number; calificacion: string; benchmark: string; }

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

  return {
    engagementRate: Number(er.toFixed(2)),
    interaccionesTotal: total,
    calificacion,
    benchmark,
  };
}
