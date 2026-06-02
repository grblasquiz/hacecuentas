export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function depreciacionAutoAnualValorResidual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v=Number(i.valor)||0; const a=Number(i.anios)||1;
  const pct1=0.2; const pctN=0.12;
  let vf=v*(1-pct1);
  for (let k=1;k<a;k++) vf*=(1-pctN);
  const perdida = v - vf;
  const pctPerdida = v > 0 ? (1 - vf / v) * 100 : 0;
  const resumen = __lang === 'en'
    ? `After ${a} years: $${vf.toFixed(0)} (loss ${pctPerdida.toFixed(0)}%).`
    : `Tras ${a} años: $${vf.toFixed(0)} (pérdida ${pctPerdida.toFixed(0)}%).`;
  const _insight = {
    title: __lang === 'en' ? 'How much value the car loses' : 'Cuánto valor pierde el auto',
    text: __lang === 'en'
      ? `After **${a} ${a === 1 ? 'year' : 'years'}** the car is worth about **$${vf.toFixed(0)}**, having lost **$${perdida.toFixed(0)}** (**${pctPerdida.toFixed(0)}%**). The first year hits hardest (~20%); after that it drops ~12% per year.`
      : `Tras **${a} ${a === 1 ? 'año' : 'años'}** el auto vale cerca de **$${vf.toFixed(0)}**, habiendo perdido **$${perdida.toFixed(0)}** (**${pctPerdida.toFixed(0)}%**). El primer año es el que más golpea (~20%); después baja ~12% por año.`,
    tone: pctPerdida >= 40 ? 'warn' : 'neutral',
    icon: '🚗',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Remaining value' : 'Valor restante', value: Math.round(vf) },
      { label: __lang === 'en' ? 'Lost to depreciation' : 'Perdido por depreciación', value: Math.round(perdida) },
    ],
    prefix: '$',
    centerValue: `$${v.toFixed(0)}`,
    centerLabel: __lang === 'en' ? 'Original value' : 'Valor inicial',
    ariaLabel: __lang === 'en'
      ? `Of $${v.toFixed(0)} original value, $${vf.toFixed(0)} remains and $${perdida.toFixed(0)} was lost to depreciation after ${a} years.`
      : `De $${v.toFixed(0)} de valor inicial, quedan $${vf.toFixed(0)} y se perdieron $${perdida.toFixed(0)} por depreciación tras ${a} años.`,
  };
  return { valorFinal:`$${vf.toFixed(0)}`, perdida:`$${perdida.toFixed(0)}`, pctAnual:`~${(pctN*100).toFixed(0)}%`, resumen, _insight, _chart };
}
