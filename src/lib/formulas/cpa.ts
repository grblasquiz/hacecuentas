/** CPA, CAC y LTV:CAC */
export interface Inputs {
  inversion: number;
  conversiones: number;
  ltv?: number;
}
export interface Outputs {
  cpa: number;
  ratioLtvCac: number;
  paybackMeses: number;
  mensaje: string;
}

export function cpa(i: Inputs): Outputs {
  const inv = Number(i.inversion);
  const conv = Number(i.conversiones);
  const ltv = Number(i.ltv) || 0;
  if (!inv || inv <= 0) throw new Error('Ingresá la inversión');
  if (!conv || conv <= 0) throw new Error('Ingresá las conversiones');

  const cpaVal = inv / conv;
  const ratio = ltv > 0 ? ltv / cpaVal : 0;
  const payback = ltv > 0 ? (cpaVal / (ltv / 12)) : 0;

  let mensaje = '';
  if (ltv === 0) mensaje = `CPA: $${cpaVal.toFixed(0)}. Ingresá el LTV para evaluar si es rentable.`;
  else if (ratio >= 3) mensaje = `Ratio LTV:CAC de ${ratio.toFixed(1)}x — saludable (ideal 3:1 o más).`;
  else if (ratio >= 1) mensaje = `Ratio ${ratio.toFixed(1)}x — cubre el costo pero necesita mejorar. Objetivo: 3x.`;
  else mensaje = `Ratio ${ratio.toFixed(1)}x — cada cliente cuesta más que lo que deja. Insostenible.`;

  return {
    cpa: Math.round(cpaVal),
    ratioLtvCac: Number(ratio.toFixed(2)),
    paybackMeses: Number(payback.toFixed(1)),
    mensaje,
  };
}
