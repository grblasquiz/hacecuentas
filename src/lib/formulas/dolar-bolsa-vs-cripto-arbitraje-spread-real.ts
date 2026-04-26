/** Spread real entre dolar MEP y dolar cripto USDT en exchanges argentinos */
export interface Inputs { montoArs: number; mepArsUsd: number; usdtArsCompra: number; comisionMepPct: number; comisionCriptoPct: number; }
export interface Outputs { dolaresMepNetos: number; usdtNetos: number; spreadAbsolutoUsd: number; spreadPct: number; recomendacion: string; explicacion: string; }
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
  const reco = dif > 0 ? 'MEP conviene' : 'USDT conviene';
  return {
    dolaresMepNetos: Number(dMep.toFixed(2)),
    usdtNetos: Number(dCripto.toFixed(2)),
    spreadAbsolutoUsd: Number(dif.toFixed(2)),
    spreadPct: Number(spreadPct.toFixed(3)),
    recomendacion: reco,
    explicacion: `Por $${ars.toLocaleString('es-AR')} ARS: MEP te da USD ${dMep.toFixed(2)}, USDT te da USDT ${dCripto.toFixed(2)}. Diferencia ${dif.toFixed(2)} USD (${spreadPct.toFixed(2)}%). ${reco} en este momento (carácter educativo, mirá disclaimer).`,
  };
}
