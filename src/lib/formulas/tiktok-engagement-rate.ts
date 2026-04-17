/** Engagement Rate TikTok */
export interface Inputs { vistas: number; likes: number; comentarios: number; shares: number; seguidores?: number; }
export interface Outputs { erPorVistas: string; erPorFollowers: string; calificacion: string; benchmark: string; }

export function tiktokEngagementRate(i: Inputs): Outputs {
  const v = Number(i.vistas);
  const l = Number(i.likes) || 0;
  const c = Number(i.comentarios) || 0;
  const s = Number(i.shares) || 0;
  const seg = i.seguidores ? Number(i.seguidores) : 0;
  if (v <= 0) throw new Error('Ingresá vistas válidas');
  const total = l + c + s;
  const erV = (total / v) * 100;
  const erF = seg > 0 ? (total / seg) * 100 : 0;
  let calif = '';
  if (erV < 3) calif = 'Bajo — por debajo del promedio';
  else if (erV < 6) calif = 'Promedio';
  else if (erV < 10) calif = 'Bueno';
  else if (erV < 15) calif = 'Muy bueno';
  else calif = 'Excelente — top 10%';
  return {
    erPorVistas: `${erV.toFixed(2)}%`,
    erPorFollowers: seg > 0 ? `${erF.toFixed(2)}%` : 'Sin seguidores cargados',
    calificacion: calif,
    benchmark: 'Promedio global TikTok (por vistas): 5-10% | Top 10%: +15%',
  };
}
