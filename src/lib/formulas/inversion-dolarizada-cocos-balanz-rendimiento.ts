export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object; _insight?: any; }
export function inversionDolarizadaCocosBalanzRendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const pv = Number(i.monto) || 0;
  const n = Number(i.plazo) || 12;            // months
  const annualRate = Number(i.tasa) || 0;     // % per year
  const r = annualRate / 100 / 12;            // monthly rate
  // Future value of lump sum: FV = PV × (1 + r)^n
  const fv = r === 0 ? pv : pv * Math.pow(1 + r, n);
  const gain = Math.max(fv - pv, 0);
  const gainPct = pv > 0 ? (gain / pv) * 100 : 0;

  const fvFmt = '$' + Math.round(fv).toLocaleString('en-US');
  const gainFmt = '$' + Math.round(gain).toLocaleString('en-US');
  const pvFmt = '$' + Math.round(pv).toLocaleString('en-US');

  const resumen = __lang === 'en'
    ? `${pvFmt} invested at ${annualRate}% for ${n} months → ${fvFmt} (gain: ${gainFmt}, +${gainPct.toFixed(1)}%).`
    : `${pvFmt} invertido al ${annualRate}% durante ${n} meses → ${fvFmt} (ganancia: ${gainFmt}, +${gainPct.toFixed(1)}%).`;

  const _insight = {
    title: __lang === 'en' ? 'Net gain after compounding' : 'Ganancia neta tras el interés compuesto',
    text: __lang === 'en'
      ? `Starting with **${pvFmt}** at **${annualRate}% annual** for **${n} months**, compound growth adds **${gainFmt}** (+${gainPct.toFixed(1)}%), ending at **${fvFmt}**.`
      : `Partiendo de **${pvFmt}** al **${annualRate}% anual** durante **${n} meses**, el interés compuesto suma **${gainFmt}** (+${gainPct.toFixed(1)}%), terminando en **${fvFmt}**.`,
    tone: gain > 0 ? 'positive' : 'neutral',
    icon: '📈',
  };

  return {
    resultado: fvFmt,
    resumen,
    _insight,
  };
}
