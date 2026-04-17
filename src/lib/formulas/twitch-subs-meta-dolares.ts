/** Twitch Subs Meta Dólares */
export interface Inputs { metaMensualUSD: number; split: string; mixTier: string; }
export interface Outputs { subsTotales: string; subsT1: number; subsT2: number; subsT3: number; }

export function twitchSubsMetaDolares(i: Inputs): Outputs {
  const meta = Number(i.metaMensualUSD);
  const split = String(i.split);
  const mix = String(i.mixTier);
  if (meta <= 0) throw new Error('Meta inválida');
  const netosT1 = split.startsWith('70') ? 3.5 : 2.5;
  const netosT2 = split.startsWith('70') ? 7 : 5;
  const netosT3 = split.startsWith('70') ? 17.5 : 12.5;
  const mixes: Record<string, [number, number, number]> = {
    '100% Tier 1 / Prime': [1, 0, 0],
    '80% T1 / 15% T2 / 5% T3': [0.8, 0.15, 0.05],
    '60% T1 / 30% T2 / 10% T3': [0.6, 0.3, 0.1],
  };
  const [p1, p2, p3] = mixes[mix] || [1, 0, 0];
  const prom = p1 * netosT1 + p2 * netosT2 + p3 * netosT3;
  const subs = Math.ceil(meta / prom);
  return {
    subsTotales: `${subs} subs (promedio $${prom.toFixed(2)} neto c/u)`,
    subsT1: Math.round(subs * p1),
    subsT2: Math.round(subs * p2),
    subsT3: Math.round(subs * p3),
  };
}
