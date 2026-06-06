export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function duracionModificadaBonoRiesgoTasa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tir = Number(i.tir) || 0;
  const anos = Number(i.anosVencimiento) || 0;
  const freq = Number(i.cupones) || 2; // coupon payments per year

  // Closed-form Macaulay Duration for an at-par bond (coupon rate = YTM).
  // This is the standard industry approximation when only YTM and maturity are known.
  // Formula: Mac_Dur (years) = [(1+r)/r * (1 - 1/(1+r)^N)] / m
  // where r = y/m (per-period yield), N = n*m (total periods), m = freq, n = years
  // Source: CFA Institute Fixed Income, Fabozzi — this is exact for par bonds.
  const y = tir / 100;          // annual YTM decimal
  const m = freq;               // periods per year
  const N = anos * m;           // total coupon periods
  const r = m > 0 ? y / m : 0; // per-period yield

  let macDurYears: number;
  if (r <= 0 || N <= 0) {
    // Zero coupon or no maturity: Macaulay Duration = maturity
    macDurYears = anos;
  } else {
    const macDurPeriods = ((1 + r) / r) * (1 - 1 / Math.pow(1 + r, N));
    macDurYears = macDurPeriods / m;
  }

  // Modified Duration = Macaulay Duration / (1 + r)
  const modDur = r > 0 ? macDurYears / (1 + r) : macDurYears;

  const dm = modDur;

  const interpretacion = __lang === 'en'
    ? `A 1-point YTM rise drops the price ~${dm.toFixed(2)}%. Higher MD means higher interest-rate volatility.`
    : `Si la TIR sube 1 punto, el precio del bono cae ~${dm.toFixed(2)}%. A mayor DM, mayor volatilidad a la tasa.`;

  const tone = dm >= 7 ? 'warn' : dm >= 3 ? 'neutral' : 'good';
  const _insight = {
    title: __lang === 'en' ? 'Rate sensitivity' : 'Sensibilidad a la tasa',
    text: __lang === 'en'
      ? `Modified duration **${dm.toFixed(2)}** means a 1-point YTM move changes the price about **${dm.toFixed(2)}%** in the opposite direction. ${dm >= 7 ? 'High volatility: this bond reacts sharply to rate changes.' : dm >= 3 ? 'Moderate sensitivity, typical of medium-term bonds.' : 'Low sensitivity: the price is fairly stable against rate swings.'} (Formula: at-par closed-form, exact for coupon = YTM.)`
      : `Duración modificada **${dm.toFixed(2)}**: un movimiento de 1 pp en la TIR cambia el precio ~**${dm.toFixed(2)}%**. ${dm >= 7 ? 'Alta volatilidad: este bono reacciona fuerte a los cambios de tasa.' : dm >= 3 ? 'Sensibilidad moderada, típica de bonos de mediano plazo.' : 'Baja sensibilidad: el precio es estable ante movimientos de tasa.'} (Fórmula exacta para bono a la par; cupón = TIR.)`,
    tone,
    icon: '📉',
  };

  return {
    durationMod: `${dm.toFixed(2)}`,
    cambioPrecio1Pct: `${dm.toFixed(2)}%`,
    interpretacion,
    _insight,
  };
}
