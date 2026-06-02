/** Twitch Subs Meta Dólares */
export interface Inputs { metaMensualUSD: number; split: string; mixTier: string; }
export interface Outputs { subsTotales: string; subsT1: number; subsT2: number; subsT3: number; _insight?: any; _chart?: any; }

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
  const sT1 = Math.round(subs * p1);
  const sT2 = Math.round(subs * p2);
  const sT3 = Math.round(subs * p3);

  const _insight = {
    title: 'Subs para tu meta',
    text: `Para llegar a **$${meta.toLocaleString('en-US')} netos al mes** necesitás **${subs} subs activos**, con un promedio de **$${prom.toFixed(2)} netos por sub** según tu split y mix de tiers.`,
    tone: 'neutral',
    icon: '🎯',
  };
  const slices = [{ label: 'Tier 1 / Prime', value: sT1 }];
  if (sT2 > 0) slices.push({ label: 'Tier 2', value: sT2 });
  if (sT3 > 0) slices.push({ label: 'Tier 3', value: sT3 });
  const totalSubs = sT1 + sT2 + sT3;
  const _chart = {
    type: 'doughnut',
    slices,
    centerValue: `${totalSubs}`,
    centerLabel: 'subs',
    ariaLabel: `Distribución de los ${totalSubs} subs por tier: ${sT1} Tier 1, ${sT2} Tier 2 y ${sT3} Tier 3`,
  };

  return {
    subsTotales: `${subs} subs (promedio $${prom.toFixed(2)} neto c/u)`,
    subsT1: sT1,
    subsT2: sT2,
    subsT3: sT3,
    _insight,
    _chart,
  };
}
