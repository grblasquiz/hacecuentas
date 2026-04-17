/** Yield farming APY real neto */
export interface Inputs { principalUsd: number; apyNominal: number; tokenPriceChange: number; gasCostUsd: number; ilPercent: number; months: number; }
export interface Outputs { apyReal: number; nominalReturn: number; ilLoss: number; gasCost: number; priceAdjustment: number; netReturnUsd: number; explicacion: string; }
export function yieldFarmingApyReal(i: Inputs): Outputs {
  const p = Number(i.principalUsd);
  const apy = Number(i.apyNominal) / 100;
  const priceChg = Number(i.tokenPriceChange) / 100;
  const gas = Number(i.gasCostUsd);
  const il = Number(i.ilPercent) / 100;
  const months = Number(i.months) || 12;
  if (!p || p <= 0) throw new Error('Ingresá capital');
  const years = months / 12;
  const nominalReturn = p * apy * years;
  const priceAdjustment = nominalReturn * priceChg;
  const nominalAfterPrice = nominalReturn + priceAdjustment;
  const ilLoss = p * il;
  const netReturn = nominalAfterPrice - gas - ilLoss;
  const apyReal = (netReturn / p) * 100 / years;
  return {
    apyReal: Number(apyReal.toFixed(3)),
    nominalReturn: Number(nominalReturn.toFixed(2)),
    ilLoss: Number(ilLoss.toFixed(2)),
    gasCost: Number(gas.toFixed(2)),
    priceAdjustment: Number(priceAdjustment.toFixed(2)),
    netReturnUsd: Number(netReturn.toFixed(2)),
    explicacion: `APY nominal ${(apy*100).toFixed(2)}%. Ajuste por precio token ${(priceChg*100).toFixed(1)}%, gas $${gas}, IL ${(il*100).toFixed(2)}%: APY real ${apyReal.toFixed(2)}%, neto $${netReturn.toFixed(2)} en ${months}m.`,
  };
}
