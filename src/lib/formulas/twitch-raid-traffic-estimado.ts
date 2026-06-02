/** Twitch Raid Traffic */
export interface Inputs { ccvRaider: number; retencionPct: number; ccvPropioActual: number; }
export interface Outputs { viewersPostRaid: number; viewersRetenidos: string; multiplicador: string; tips: string; _insight?: any; _chart?: any; }

export function twitchRaidTrafficEstimado(i: Inputs): Outputs {
  const r = Number(i.ccvRaider);
  const pct = Number(i.retencionPct);
  const propio = Number(i.ccvPropioActual) || 0;
  if (r <= 0 || pct <= 0) throw new Error('Valores inválidos');
  const retenidos = Math.round(r * (pct / 100));
  const post = propio + retenidos;
  const mult = propio > 0 ? (post / propio) : post;

  const tone = mult >= 2 ? 'good' : mult >= 1.3 ? 'neutral' : 'warn';
  const text = propio > 0
    ? `El raid de **${r} viewers** te suma **${retenidos} espectadores** y deja tu stream en **${post} en vivo**: multiplicás tu audiencia previa por **${mult.toFixed(1)}x**.`
    : `El raid te aporta **${retenidos} espectadores** (${pct}% de retención sobre los ${r} del raider), arrancando tu stream en **${post} en vivo**.`;
  const _insight = {
    title: 'Impacto del raid',
    text,
    tone,
    icon: '📡',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Tu audiencia previa', value: propio },
      { label: 'Nuevos del raid', value: retenidos },
    ],
    centerValue: `${post}`,
    centerLabel: 'viewers en vivo',
    ariaLabel: `Composición de tu audiencia tras el raid: ${propio} propios y ${retenidos} nuevos, total ${post}`,
  };

  return {
    viewersPostRaid: post,
    viewersRetenidos: `${retenidos} viewers nuevos (${pct}% del raider)`,
    multiplicador: `${mult.toFixed(1)}x tu audiencia previa`,
    tips: 'Agradecé al raider por nombre + mostrá contenido activo los primeros 2 min',
    _insight,
    _chart,
  };
}
