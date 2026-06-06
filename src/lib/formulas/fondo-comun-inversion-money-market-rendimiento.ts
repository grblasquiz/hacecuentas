export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fondoComunInversionMoneyMarketRendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.monto) || 0;
  const p = Number(i.plazo) || 12;           // months
  const tasa = Number(i.tasa) || 0;           // annual rate %
  const tasaMensual = tasa / 100 / 12;

  // Compound interest yield: Final = Principal × (1 + r/12)^n
  const final = m * Math.pow(1 + tasaMensual, p);
  const ganancia = final - m;
  const yieldPct = m > 0 ? (ganancia / m) * 100 : 0;

  // Also compute PMT (monthly sustainable withdrawal) for ES use case
  // PMT = M × i × (1+i)^P / ((1+i)^P − 1)
  const pmt = tasaMensual === 0 ? m / p : m * tasaMensual * Math.pow(1 + tasaMensual, p) / (Math.pow(1 + tasaMensual, p) - 1);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');

  const resumen = __lang === 'en'
    ? `$${m.toLocaleString('en-US')} at ${tasa.toFixed(1)}% APY for ${p} months → earn $${Math.round(ganancia).toLocaleString('en-US')} in interest (${yieldPct.toFixed(2)}% total return).`
    : `$${m.toLocaleString('es-AR')} al ${tasa.toFixed(1)}% TNA a ${p} meses → retiro mensual máximo: $${Math.round(pmt).toLocaleString('es-AR')}/mes (total intereses: $${Math.round(ganancia).toLocaleString('es-AR')}).`;

  const _insight = __lang === 'en'
    ? {
        title: 'Money Market Fund Yield',
        text: `At **${tasa.toFixed(1)}% APY**, **${fmt(m)}** earns **${fmt(ganancia)}** over ${p} months, growing to **${fmt(final)}** — a **${yieldPct.toFixed(2)}% total return**. Money-market funds offer daily liquidity with no lock-in period.`,
        tone: 'positive',
        icon: '📈'
      }
    : {
        title: 'Rendimiento FCI Money Market',
        text: `Con **${tasa.toFixed(1)}% TNA**, **${fmt(m)}** genera **${fmt(ganancia)}** en ${p} meses. Podés retirar **${fmt(pmt)}/mes** durante ese período hasta consumir capital + intereses. Rescate T+0 sin penalización.`,
        tone: 'positive',
        icon: '📈'
      };

  return {
    ganancia: fmt(ganancia),
    finalAmount: fmt(final),
    yieldPct: yieldPct.toFixed(2) + '%',
    resultado: fmt(pmt),   // ES legacy: monthly withdrawal
    resumen,
    _insight
  };
}
