export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function rolIra401kArgentinoEquivalente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // monto = accumulated capital / lump sum
  // plazo = months to distribute
  // tasa  = annual return rate %
  const m = Number(i.monto) || 0;
  const p = Number(i.plazo) || 120;     // months
  const t = (Number(i.tasa) || 0) / 100 / 12; // monthly rate

  // Sustainable monthly withdrawal (annuity formula)
  // R = M × t × (1+t)^p / ((1+t)^p - 1)
  const r = t === 0 ? m / p : m * t * Math.pow(1 + t, p) / (Math.pow(1 + t, p) - 1);

  const totalWithdrawn = r * p;
  const totalGrowth = Math.max(0, totalWithdrawn - m);

  const fmt = (v: number) =>
    '$' + v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const cuotaFmt = fmt(r);
  const totalFmt = fmt(totalWithdrawn);
  const growthFmt = fmt(totalGrowth);

  const resumen = __lang === 'en'
    ? `${p} months at ${(Number(i.tasa) || 0)}% → Total withdrawn: ${totalFmt} | Growth received: ${growthFmt}`
    : `${p} meses al ${(Number(i.tasa) || 0)}% → Total retirado: ${totalFmt} | Rendimiento recibido: ${growthFmt}`;

  const insight = {
    title: __lang === 'en' ? 'Sustainable monthly withdrawal' : 'Retiro mensual sostenible',
    text: __lang === 'en'
      ? `Withdrawing **${cuotaFmt}/month** from ${fmt(m)} for ${p} months (${(p / 12).toFixed(0)} years) at ${Number(i.tasa) || 0}% annual return: you receive **${totalFmt}** total${totalGrowth > 0 ? ` — **${growthFmt}** more than your starting capital` : ''}.`
      : `Retirando **${cuotaFmt}/mes** de ${fmt(m)} durante ${p} meses (${(p / 12).toFixed(0)} años) al ${Number(i.tasa) || 0}% anual: recibís **${totalFmt}** en total${totalGrowth > 0 ? ` — **${growthFmt}** más que tu capital inicial` : ''}.`,
    tone: totalGrowth > 0 ? 'good' : 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '🏦',
  };

  return { resultado: cuotaFmt, resumen, _insight: insight };
}
