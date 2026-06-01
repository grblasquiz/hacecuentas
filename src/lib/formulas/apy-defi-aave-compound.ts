export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function apyDefiAaveCompound(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.montoUsd)||0; const a=Number(i.apy)||0; const d=Number(i.plazoDias)||0;
  const g=m*a/100*d/365; const f=m+g;
  const interpretacion = __lang === 'en'
    ? `With ${a}% APY over ${d} days: you earn USD ${g.toFixed(2)}.`
    : `Con ${a}% APY durante ${d} días: ganás USD ${g.toFixed(2)}.`;
  const fmt = (n:number)=>n.toLocaleString(__lang==='en'?'en-US':'es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pctGanado = m>0 ? (g/m*100) : 0;
  // APY alto en DeFi suele venir de protocolos o tokens de riesgo (impermanent loss, incentivos temporales)
  const tone = a >= 20 ? 'warn' : 'good';
  const _insight = {
    title: __lang==='en' ? 'Your DeFi yield' : 'Tu rendimiento DeFi',
    text: __lang==='en'
      ? `Over **${d} days** your USD ${fmt(m)} earns **USD ${fmt(g)}** (${pctGanado.toFixed(2)}% on capital), ending at USD ${fmt(f)}.${a>=20?' A **'+a+'% APY** is high — check it is not a temporary incentive or impermanent-loss risk.':''}`
      : `En **${d} días** tus USD ${fmt(m)} generan **USD ${fmt(g)}** (${pctGanado.toFixed(2)}% sobre el capital) y terminás con USD ${fmt(f)}.${a>=20?' Un **APY de '+a+'%** es alto: fijate que no sea un incentivo temporal o riesgo de impermanent loss.':''}`,
    tone,
    icon: '🏦',
  };
  const _chart = m>0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang==='en' ? 'Capital' : 'Capital invertido', value: Number(m.toFixed(2)) },
      { label: __lang==='en' ? 'Yield' : 'Ganancia', value: Number(g.toFixed(2)) },
    ],
    prefix: 'USD ',
    centerValue: `USD ${fmt(f)}`,
    centerLabel: __lang==='en' ? 'Final value' : 'Valor final',
    ariaLabel: __lang==='en'
      ? `Final value of USD ${fmt(f)} split into capital USD ${fmt(m)} and yield USD ${fmt(g)}.`
      : `Valor final de USD ${fmt(f)} dividido en capital USD ${fmt(m)} y ganancia USD ${fmt(g)}.`,
  } : undefined;
  return { ganancia:`USD ${g.toFixed(2)}`, valorFinal:`USD ${f.toFixed(2)}`, interpretacion, _insight, ...(_chart?{_chart}:{}) };
}
