/** DeFi hack risk score heurístico */
export interface Inputs { tvlUsd: number; audits: number; ageMonths: number; hasBounty: boolean; hasTimelock: boolean; multisig: number; tokenHolders: number; }
export interface Outputs { riskScore: number; riskLabel: string; breakdown: string; recommendedExposure: number; explicacion: string; }
export function defiProtocolHackRisk(i: Inputs): Outputs {
  const tvl = Number(i.tvlUsd);
  const audits = Number(i.audits);
  const age = Number(i.ageMonths);
  const bounty = Boolean(i.hasBounty);
  const timelock = Boolean(i.hasTimelock);
  const multisig = Number(i.multisig);
  const holders = Number(i.tokenHolders);
  if (tvl < 0) throw new Error('TVL inválido');
  let score = 0;
  let breakdown = '';
  if (tvl > 1e9) { score += 25; breakdown += '+25 TVL>$1B. '; }
  else if (tvl > 1e8) { score += 18; breakdown += '+18 TVL>$100M. '; }
  else if (tvl > 1e7) { score += 10; breakdown += '+10 TVL>$10M. '; }
  else if (tvl > 1e6) { score += 5; breakdown += '+5 TVL>$1M. '; }
  else { score += 0; breakdown += '+0 TVL bajo. '; }
  const aBonus = Math.min(audits * 8, 24);
  score += aBonus; breakdown += `+${aBonus} audits (${audits}). `;
  if (age > 36) { score += 20; breakdown += '+20 edad>3a. '; }
  else if (age > 12) { score += 12; breakdown += '+12 edad>1a. '; }
  else if (age > 6) { score += 6; breakdown += '+6 edad>6m. '; }
  if (bounty) { score += 8; breakdown += '+8 bug bounty. '; }
  if (timelock) { score += 8; breakdown += '+8 timelock. '; }
  if (multisig >= 5) { score += 8; breakdown += '+8 multisig>=5. '; }
  else if (multisig >= 3) { score += 4; breakdown += '+4 multisig>=3. '; }
  if (holders > 10000) { score += 7; breakdown += '+7 holders>10K. '; }
  const total = Math.min(score, 100);
  let label = '';
  let exposure = 0;
  if (total >= 80) { label = 'Muy bajo riesgo'; exposure = 25; }
  else if (total >= 60) { label = 'Bajo riesgo'; exposure = 15; }
  else if (total >= 40) { label = 'Riesgo medio'; exposure = 5; }
  else if (total >= 20) { label = 'Alto riesgo'; exposure = 1; }
  else { label = 'Riesgo extremo'; exposure = 0.25; }
  return {
    riskScore: total,
    riskLabel: label,
    breakdown: breakdown,
    recommendedExposure: Number(exposure.toFixed(2)),
    explicacion: `Score ${total}/100 → ${label}. Exposure máxima sugerida: ${exposure}% del portfolio.`,
  };
}
