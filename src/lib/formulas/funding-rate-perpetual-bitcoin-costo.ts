export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fundingRatePerpetualBitcoinCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t=Number(i.tamanoUsd)||0; const r=Number(i.fundingRate)||0; const h=Number(i.horasOpen)||0;
  const intervalos=h/8; const funding=t*r/100*intervalos; const pct=t>0?(funding/t*100):0;
  const interpretacion = __lang === 'en'
    ? `In ${h}h you pay/receive USD ${funding.toFixed(2)} in funding.`
    : `En ${h}h pagás/cobrás USD ${funding.toFixed(2)} por funding.`;
  const abs = Math.abs(funding);
  const tone = funding > 0.005 ? 'warn' : funding < -0.005 ? 'good' : 'neutral';
  const _insight = {
    title: __lang === 'en' ? 'Funding impact' : 'Impacto del funding',
    text: tone === 'warn'
      ? (__lang === 'en'
          ? `Holding **USD ${t.toLocaleString('en-US')}** for **${h}h** (${intervalos.toFixed(0)} funding windows) costs you **USD ${abs.toFixed(2)}** — that is **${Math.abs(pct).toFixed(3)}%** of your position eaten by funding alone.`
          : `Mantener **USD ${t.toLocaleString('es-AR')}** durante **${h}h** (${intervalos.toFixed(0)} cobros de funding) te cuesta **USD ${abs.toFixed(2)}**: un **${Math.abs(pct).toFixed(3)}%** de tu posición se va sólo en funding.`)
      : tone === 'good'
        ? (__lang === 'en'
            ? `With this rate you **receive USD ${abs.toFixed(2)}** for holding **USD ${t.toLocaleString('en-US')}** over **${h}h** — funding pays you **${Math.abs(pct).toFixed(3)}%** of your position.`
            : `Con esta tasa **cobrás USD ${abs.toFixed(2)}** por sostener **USD ${t.toLocaleString('es-AR')}** durante **${h}h**: el funding te paga un **${Math.abs(pct).toFixed(3)}%** de la posición.`)
        : (__lang === 'en'
            ? `At this rate, funding is essentially neutral over **${h}h**: about **USD ${abs.toFixed(2)}**, negligible against your **USD ${t.toLocaleString('en-US')}** position.`
            : `A esta tasa, el funding es prácticamente neutro en **${h}h**: unos **USD ${abs.toFixed(2)}**, despreciable frente a tu posición de **USD ${t.toLocaleString('es-AR')}**.`),
    tone,
    icon: '📉',
  };
  return { fundingTotal:`USD ${funding.toFixed(2)}`, porcentaje:`${pct.toFixed(3)}%`, interpretacion, _insight };
}
