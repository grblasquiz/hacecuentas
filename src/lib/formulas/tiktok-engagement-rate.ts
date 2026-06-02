/** Engagement Rate TikTok */
export interface Inputs { vistas: number; likes: number; comentarios: number; shares: number; seguidores?: number; }
export interface Outputs { erPorVistas: string; erPorFollowers: string; calificacion: string; benchmark: string; _insight?: any; _chart?: any; }

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

  const _insight = {
    title: 'Tu engagement rate',
    text: `Tu video tiene un **ER del ${erV.toFixed(2)}%** sobre vistas (${l + c + s} interacciones en ${v.toLocaleString('es-AR')} reproducciones): **${calif.toLowerCase()}**. El promedio en TikTok ronda 5-10%, bastante más alto que en Instagram o YouTube.`,
    tone: erV < 3 ? 'warn' : erV >= 10 ? 'good' : 'neutral',
    icon: '📊',
  };

  const _chart = {
    type: 'scale',
    marker: Number(erV.toFixed(2)),
    markerLabel: `${erV.toFixed(2)}%`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 3, color: '#f87171', colorDark: '#ef4444' },
      { nombre: 'Promedio', max: 6, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Bueno', max: 10, color: '#a3e635', colorDark: '#84cc16' },
      { nombre: 'Muy bueno', max: 15, color: '#4ade80', colorDark: '#22c55e' },
      { nombre: 'Excelente', max: Math.max(20, Number((erV * 1.1).toFixed(2))), color: '#22d3ee', colorDark: '#06b6d4' },
    ],
    ariaLabel: `Engagement rate de ${erV.toFixed(2)}% por vistas, calificación: ${calif}`,
  };

  return {
    erPorVistas: `${erV.toFixed(2)}%`,
    erPorFollowers: seg > 0 ? `${erF.toFixed(2)}%` : 'Sin seguidores cargados',
    calificacion: calif,
    benchmark: 'Promedio global TikTok (por vistas): 5-10% | Top 10%: +15%',
    _insight,
    _chart,
  };
}
