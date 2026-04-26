/** Comparativa fee de transaccion en L2 Base, Arbitrum, Optimism, zkSync */
export interface Inputs { gasUnits: number; gweiBase: number; gweiArbitrum: number; gweiOptimism: number; gweiZkSync: number; ethUsd: number; }
export interface Outputs { feeBaseUsd: number; feeArbitrumUsd: number; feeOptimismUsd: number; feeZkSyncUsd: number; cheapest: string; ahorroVsMasCaro: number; explicacion: string; }
export function ethereumL2BaseArbitrumOptimismFeeComparativa(i: Inputs): Outputs {
  const g = Number(i.gasUnits);
  const eth = Number(i.ethUsd);
  if (!g || g <= 0) throw new Error('Ingresá el gas units estimado');
  if (!eth || eth <= 0) throw new Error('Ingresá el precio de ETH en USD');
  const calc = (gwei: number) => (g * gwei * 1e-9) * eth;
  const fB = calc(Number(i.gweiBase));
  const fA = calc(Number(i.gweiArbitrum));
  const fO = calc(Number(i.gweiOptimism));
  const fZ = calc(Number(i.gweiZkSync));
  const map = { Base: fB, Arbitrum: fA, Optimism: fO, zkSync: fZ };
  const cheapest = Object.entries(map).sort((a, b) => a[1] - b[1])[0][0];
  const max = Math.max(fB, fA, fO, fZ);
  const min = Math.min(fB, fA, fO, fZ);
  return {
    feeBaseUsd: Number(fB.toFixed(4)),
    feeArbitrumUsd: Number(fA.toFixed(4)),
    feeOptimismUsd: Number(fO.toFixed(4)),
    feeZkSyncUsd: Number(fZ.toFixed(4)),
    cheapest,
    ahorroVsMasCaro: Number((max - min).toFixed(4)),
    explicacion: `Para ${g.toLocaleString('en-US')} gas units a ETH USD ${eth}: Base USD ${fB.toFixed(4)}, Arbitrum USD ${fA.toFixed(4)}, Optimism USD ${fO.toFixed(4)}, zkSync USD ${fZ.toFixed(4)}. Más barato: ${cheapest}.`,
  };
}
