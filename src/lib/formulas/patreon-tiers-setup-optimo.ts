/** Patreon Tiers Setup */
export interface Inputs { audienciaTotal: number; conversionRate: number; plan: string; }
export interface Outputs { patronsEstimados: number; setupTiers: string; ingresoBruto: string; ingresoNeto: string; }

export function patreonTiersSetupOptimo(i: Inputs): Outputs {
  const aud = Number(i.audienciaTotal);
  const cr = Number(i.conversionRate);
  const plan = String(i.plan);
  if (aud <= 0 || cr <= 0) throw new Error('Valores inválidos');
  const patrons = Math.round(aud * (cr / 100));
  // Mix estándar: 60% $5, 30% $15, 10% $50
  const t1 = Math.round(patrons * 0.6);
  const t2 = Math.round(patrons * 0.3);
  const t3 = patrons - t1 - t2;
  const bruto = t1 * 5 + t2 * 15 + t3 * 50;
  const comPct = plan.startsWith('Lite') ? 0.05 : plan.startsWith('Pro') ? 0.08 : 0.12;
  const fees = bruto * 0.029 + patrons * 0.30;
  const neto = bruto * (1 - comPct) - fees;
  return {
    patronsEstimados: patrons,
    setupTiers: `${t1} a $5 (Seguidor) + ${t2} a $15 (Fan) + ${t3} a $50 (Super Fan)`,
    ingresoBruto: `$${bruto.toLocaleString('en-US', {maximumFractionDigits: 0})} USD`,
    ingresoNeto: `$${neto.toLocaleString('en-US', {maximumFractionDigits: 0})} USD (después de ${(comPct*100)}% Patreon + fees)`,
  };
}
