export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroAutoElectricoVsNaftaAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km=Number(i.km)||0; const ev=Number(i.evKwh)||18; const n=Number(i.nkm)||12; const pe=Number(i.pElec)||0.15; const pn=Number(i.pNafta)||1.2;
  const evC=km*ev/100*pe; const nC=km/n*pn;
  const resumen = __lang === 'en'
    ? `EV $${evC.toFixed(0)}/yr vs Gas $${nC.toFixed(0)} → savings $${(nC-evC).toFixed(0)}.`
    : `EV $${evC.toFixed(0)}/año vs Nafta $${nC.toFixed(0)} → ahorro $${(nC-evC).toFixed(0)}.`;

  const ahorro = nC - evC;
  const ahorroAbs = Math.abs(ahorro).toFixed(0);
  const evFmt = evC.toFixed(0);
  const nFmt = nC.toFixed(0);
  const pctMenos = nC > 0 ? Math.round((1 - evC / nC) * 100) : 0;
  let _insight;
  if (ahorro > 0) {
    _insight = {
      title: __lang === 'en' ? 'The EV is cheaper to run' : 'El eléctrico es más barato de usar',
      text: __lang === 'en'
        ? `Charging costs **$${evFmt}/yr** versus **$${nFmt}** on gasoline — you save **$${ahorroAbs}/yr** (about **${pctMenos}% less** in fuel). This is energy cost only; it ignores the EV's higher purchase price and battery wear.`
        : `Cargar cuesta **$${evFmt}/año** contra **$${nFmt}** en nafta: ahorrás **$${ahorroAbs}/año** (cerca de **${pctMenos}% menos** en combustible). Es solo el costo de energía; no incluye el mayor precio de compra del eléctrico ni el desgaste de la batería.`,
      tone: 'good',
      icon: '🔌',
    };
  } else {
    _insight = {
      title: __lang === 'en' ? 'The EV costs more here' : 'Acá el eléctrico cuesta más',
      text: __lang === 'en'
        ? `With these prices charging runs **$${evFmt}/yr** versus **$${nFmt}** on gas — **$${ahorroAbs}/yr more**. High electricity rates or a thirsty EV flip the math; recheck your $/kWh.`
        : `Con estos precios cargar sale **$${evFmt}/año** contra **$${nFmt}** en nafta: **$${ahorroAbs}/año más**. Una tarifa eléctrica alta o un EV muy consumidor dan vuelta el cálculo; revisá tu $/kWh.`,
      tone: 'warn',
      icon: '⚡',
    };
  }

  return { evCosto:`$${evC.toFixed(0)}`, nCosto:`$${nC.toFixed(0)}`, ahorro:`$${(nC-evC).toFixed(0)}`, resumen, _insight };
}
