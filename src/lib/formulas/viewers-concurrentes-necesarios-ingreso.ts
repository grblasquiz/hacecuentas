/** Viewers Concurrentes Ingreso */
export interface Inputs { metaMensualUSD: number; plataforma: string; monetizacion: string; }
export interface Outputs { ccvNecesarios: string; ratio: string; comparacion: string; factibilidad: string; _insight?: any; _chart?: any; }

export function viewersConcurrentesNecesariosIngreso(i: Inputs): Outputs {
  const meta = Number(i.metaMensualUSD);
  const p = String(i.plataforma);
  const m = String(i.monetizacion);
  if (meta <= 0) throw new Error('Meta inválida');
  const ratios: Record<string, Record<string, number>> = {
    'Twitch': { 'Sólo subs + bits (sin sponsors)': 7, 'Balanced (subs + sponsors)': 11, 'Sponsor-heavy (50%+ patrocinios)': 17 },
    'YouTube Live': { 'Sólo subs + bits (sin sponsors)': 9, 'Balanced (subs + sponsors)': 13, 'Sponsor-heavy (50%+ patrocinios)': 22 },
    'Kick': { 'Sólo subs + bits (sin sponsors)': 11, 'Balanced (subs + sponsors)': 16, 'Sponsor-heavy (50%+ patrocinios)': 22 },
    'TikTok Live': { 'Sólo subs + bits (sin sponsors)': 4, 'Balanced (subs + sponsors)': 7, 'Sponsor-heavy (50%+ patrocinios)': 12 },
  };
  const r = ratios[p]?.[m] || 10;
  const ccv = Math.ceil(meta / r);
  let fact = '';
  if (ccv < 50) fact = 'Muy factible — meta realista en 6-12 meses';
  else if (ccv < 200) fact = 'Factible pero exige 1-2 años de crecimiento sostenido';
  else if (ccv < 1000) fact = 'Ambicioso — top 5% de streamers activos';
  else fact = 'Muy ambicioso — requiere audiencia top 1% o multi-stream';
  const tone = ccv < 50 ? 'good' : ccv < 200 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Cuántos espectadores necesitás',
    text: `Para juntar **$${meta.toLocaleString('es-AR')} USD/mes** en ${p} con esta monetización (≈ **$${r}/CCV/mes**) necesitás un promedio de **${ccv.toLocaleString('es-AR')} espectadores concurrentes**. ${fact}.`,
    tone,
    icon: '🎮',
  };

  const topMax = ccv >= 1000 ? Math.ceil(ccv / 500) * 500 + 500 : 1000;
  const _chart = {
    type: 'scale',
    marker: ccv,
    markerLabel: `${ccv.toLocaleString('es-AR')} CCV`,
    min: 0,
    segments: [
      { nombre: 'Muy factible', max: 50, color: '#34d399', colorDark: '#047857' },
      { nombre: 'Factible', max: 200, color: '#a3e635', colorDark: '#4d7c0f' },
      { nombre: 'Ambicioso', max: 1000, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Muy ambicioso', max: topMax, color: '#f87171', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Necesitás ${ccv} espectadores concurrentes promedio`,
  };

  return {
    ccvNecesarios: `${ccv.toLocaleString('es-AR')} CCV promedio`,
    ratio: `$${r} USD/CCV/mes`,
    comparacion: 'Twitch: $7-17 | YouTube Live: $9-22 | Kick: $11-22 | TikTok Live: $4-12',
    factibilidad: fact,
    _insight,
    _chart,
  };
}
