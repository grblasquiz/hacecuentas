/** Spread real entre dolar MEP y dolar cripto USDT en exchanges argentinos */
export interface Inputs { montoArs: number; mepArsUsd: number; usdtArsCompra: number; comisionMepPct: number; comisionCriptoPct: number; }
export interface Outputs { dolaresMepNetos: number; usdtNetos: number; spreadAbsolutoUsd: number; spreadPct: number; recomendacion: string; explicacion: string; _insight?: any; }
export function dolarBolsaVsCriptoArbitrajeSpreadReal(i: Inputs): Outputs {
  const ars = Number(i.montoArs);
  const mep = Number(i.mepArsUsd);
  const usdt = Number(i.usdtArsCompra);
  const cMep = Number(i.comisionMepPct) / 100;
  const cCripto = Number(i.comisionCriptoPct) / 100;
  if (!ars || ars <= 0) throw new Error('Ingresá el monto en pesos');
  if (!mep || mep <= 0) throw new Error('Ingresá el dólar MEP');
  if (!usdt || usdt <= 0) throw new Error('Ingresá el USDT/ARS');
  const dMep = (ars * (1 - cMep)) / mep;
  const dCripto = (ars * (1 - cCripto)) / usdt;
  const dif = dMep - dCripto;
  const spreadPct = (dif / dMep) * 100;
  const gana = dif >= 0 ? 'el MEP' : 'el USDT cripto';
  const reco = dif > 0 ? 'MEP conviene' : 'USDT conviene';
  const difAbs = Math.abs(dif);
  const pctAbs = Math.abs(spreadPct);
  const _insight = {
    title: 'Cuál te deja más dólares',
    text: difAbs < 0.5
      ? `Por $${ars.toLocaleString('es-AR')} ARS el MEP y el USDT quedan casi empatados (diferencia de solo **${difAbs.toFixed(2)} USD**, ${pctAbs.toFixed(2)}%): elegí por comodidad y velocidad, no por el spread.`
      : `Por $${ars.toLocaleString('es-AR')} ARS conviene **${gana}**: te deja **${difAbs.toFixed(2)} USD** más (**${pctAbs.toFixed(2)}%** de spread) ya descontadas las comisiones.`,
    tone: difAbs < 0.5 ? 'neutral' : 'good',
    icon: '⚖️',
  };
  return {
    dolaresMepNetos: Number(dMep.toFixed(2)),
    usdtNetos: Number(dCripto.toFixed(2)),
    spreadAbsolutoUsd: Number(dif.toFixed(2)),
    spreadPct: Number(spreadPct.toFixed(3)),
    recomendacion: reco,
    explicacion: `Por $${ars.toLocaleString('es-AR')} ARS: MEP te da USD ${dMep.toFixed(2)}, USDT te da USDT ${dCripto.toFixed(2)}. Diferencia ${dif.toFixed(2)} USD (${spreadPct.toFixed(2)}%). ${reco} en este momento (carácter educativo, mirá disclaimer).`,
    _insight,
  };
}
