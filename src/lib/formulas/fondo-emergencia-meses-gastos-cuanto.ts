export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function fondoEmergenciaMesesGastosCuanto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const val = Number(i.monto) || 0;
  const plazo = Number(i.plazo) || 6;
  const annualRate = (Number(i.tasa) || 0) / 100;
  const monthlyRate = annualRate / 12;

  const fmt = (n: number) =>
    __lang === 'en'
      ? n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (__lang === 'en') {
    // EN: val = monthly expenses, plazo = months to cover
    // Target = monthly expenses × months to cover
    const target = val * plazo;
    const annualInterestEarned = target * annualRate;
    const monthlyInterestEarned = annualInterestEarned / 12;

    const cushionLabel =
      plazo <= 1 ? 'minimal (1 month)'
      : plazo <= 2 ? 'small (2 months)'
      : plazo <= 3 ? 'starter (3 months)'
      : plazo <= 6 ? 'recommended (3–6 months)'
      : 'extra cushion (6+ months)';

    const resultado = '$' + fmt(target);
    const resumen =
      `$${fmt(val)}/mo × ${plazo} months = $${fmt(target)} target` +
      (annualRate > 0 ? ` | Earns ~$${fmt(annualInterestEarned)}/yr in a ${(Number(i.tasa) || 0).toFixed(2)}% HYSA` : '');

    const _insight = {
      title: 'Your emergency fund target',
      text: `Save **$${fmt(target)}** — that's ${plazo} months of expenses at $${fmt(val)}/mo. This is a ${cushionLabel} cushion.` +
        (annualRate > 0 ? ` Kept in a ${(Number(i.tasa) || 0).toFixed(2)}% HYSA, it earns ~$${fmt(monthlyInterestEarned)}/mo in interest once fully funded.` : ''),
      tone: 'positive',
      icon: '🏦',
    };

    return { resultado, resumen, _insight };

  } else {
    // ES: val = objetivo del fondo (target amount), plazo = meses para armarlo
    // Monthly savings needed (PMT formula) to reach the target in plazo months
    const r = monthlyRate === 0
      ? val / plazo
      : val * monthlyRate * Math.pow(1 + monthlyRate, plazo) / (Math.pow(1 + monthlyRate, plazo) - 1);

    const resultado = '$' + fmt(r);
    const totalAportado = r * plazo;
    const interes = Math.max(0, val - totalAportado);

    const resumen =
      `Monto $${fmt(val)} × ${plazo} meses: $${fmt(r)}/mes.` +
      (monthlyRate > 0 ? ` El interés aporta unos $${fmt(interes)}, así que ponés menos de tu bolsillo.` : '');

    const _insight = {
      title: 'Tu cuota mensual',
      text: `Apartá **$${fmt(r)}/mes** durante **${plazo} meses** para llegar a $${fmt(val)}.` +
        (monthlyRate > 0 ? ` El interés acumulado aporta unos $${fmt(interes)}, así que ponés menos de tu bolsillo.` : ''),
      tone: 'neutral',
      icon: '🐷',
    };

    return { resultado, resumen, _insight };
  }
}
