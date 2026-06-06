export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Stock Options Vesting Calculator — standard 4-year schedule with 1-year cliff.
 *
 * Inputs:
 *   monto  — total grant value in USD (or number of shares × current price)
 *   plazo  — how many years you've been (or plan to be) at the company (1–4)
 *   tasa   — expected annual stock price appreciation in % (e.g. 10 = 10%)
 *
 * Vesting schedule (industry standard):
 *   - Year 1 cliff  → 25% of grant vests in a single block
 *   - Months 13–48 → remaining 75% vests monthly (2.0833%/month of total grant)
 *   - Vested fraction after t years (t ≥ 1): 0.25 + ((t - 1) / 3) × 0.75
 *
 * Stock value appreciation: each share is worth more if the stock grows.
 *   current_value = grant × vested_fraction × (1 + annual_rate)^t
 *
 * Output:
 *   resultado — estimated current value of vested equity
 *   resumen   — schedule at cliff / 2yr / 3yr / 4yr
 */
export function stockOptionsVestingTechStartup(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const fmt = (n: number) =>
    Math.round(n).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');

  const grant = Number(i.monto) || 0;
  // plazo is years at company (1-4 typical; cap at 4 for vesting purposes)
  const years = Math.max(0, Number(i.plazo) || 4);
  const annualRate = (Number(i.tasa) || 0) / 100;

  // Vested fraction: 0 if < 1 year (cliff not reached), then ramp
  function vestedFraction(t: number): number {
    if (t < 1) return 0; // before cliff
    if (t >= 4) return 1; // fully vested
    return 0.25 + ((t - 1) / 3) * 0.75;
  }

  // Value of vested equity at year t (stock has appreciated)
  function valueAt(t: number): number {
    return grant * vestedFraction(t) * Math.pow(1 + annualRate, t);
  }

  const vestedNow = vestedFraction(years);
  const totalValue = valueAt(years);
  const vestedPct = (vestedNow * 100).toFixed(1);

  // Schedule table values
  const v1 = valueAt(1);
  const v2 = valueAt(2);
  const v3 = valueAt(3);
  const v4 = valueAt(4);

  const resultado = `$${fmt(totalValue)}`;

  const resumen =
    __lang === 'en'
      ? `After ${years.toFixed(1)} yr: ${vestedPct}% vested → $${fmt(totalValue)} | Yr1: $${fmt(v1)} | Yr2: $${fmt(v2)} | Yr3: $${fmt(v3)} | Yr4: $${fmt(v4)}`
      : `A ${years.toFixed(1)} años: ${vestedPct}% vestido → $${fmt(totalValue)} | Año1: $${fmt(v1)} | Año2: $${fmt(v2)} | Año3: $${fmt(v3)} | Año4: $${fmt(v4)}`;

  const _insight = {
    title: __lang === 'en' ? 'Your vested equity value' : 'Tu equity vestido',
    text:
      __lang === 'en'
        ? `At **${years.toFixed(1)} years**, you've vested **${vestedPct}%** of your grant. Estimated value (with ${(annualRate * 100).toFixed(0)}%/yr growth): **$${fmt(totalValue)}**. Full vesting at 4 years: **$${fmt(v4)}**.`
        : `A **${years.toFixed(1)} años**, vestiste **${vestedPct}%** de tu grant. Valor estimado (con ${(annualRate * 100).toFixed(0)}%/año de crecimiento): **$${fmt(totalValue)}**. Fully vested a 4 años: **$${fmt(v4)}**.`,
    tone: vestedNow < 0.5 ? 'warn' : 'neutral',
    icon: '📊',
  };

  return { resultado, resumen, _insight };
}
