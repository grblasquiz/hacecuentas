/** Twitch Raid Traffic */
export interface Inputs { ccvRaider: number; retencionPct: number; ccvPropioActual: number; }
export interface Outputs { viewersPostRaid: number; viewersRetenidos: string; multiplicador: string; tips: string; }

export function twitchRaidTrafficEstimado(i: Inputs): Outputs {
  const r = Number(i.ccvRaider);
  const pct = Number(i.retencionPct);
  const propio = Number(i.ccvPropioActual) || 0;
  if (r <= 0 || pct <= 0) throw new Error('Valores inválidos');
  const retenidos = Math.round(r * (pct / 100));
  const post = propio + retenidos;
  const mult = propio > 0 ? (post / propio) : post;
  return {
    viewersPostRaid: post,
    viewersRetenidos: `${retenidos} viewers nuevos (${pct}% del raider)`,
    multiplicador: `${mult.toFixed(1)}x tu audiencia previa`,
    tips: 'Agradecé al raider por nombre + mostrá contenido activo los primeros 2 min',
  };
}
