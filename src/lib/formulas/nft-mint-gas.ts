/** NFT mint gas cost */
export interface Inputs { gasPriceGwei: number; gasUnitsMint: number; ethPriceUsd: number; mintPriceEth: number; quantity: number; }
export interface Outputs { gasCostEth: number; gasCostUsd: number; mintCostEth: number; totalCostEth: number; totalCostUsd: number; gasPerMintUsd: number; explicacion: string; }
export function nftMintGas(i: Inputs): Outputs {
  const gwei = Number(i.gasPriceGwei);
  const units = Number(i.gasUnitsMint);
  const ethUsd = Number(i.ethPriceUsd);
  const mint = Number(i.mintPriceEth);
  const qty = Number(i.quantity) || 1;
  if (!gwei || gwei <= 0) throw new Error('Gas price');
  if (!units || units <= 0) throw new Error('Gas units');
  if (!ethUsd || ethUsd <= 0) throw new Error('Precio ETH');
  const gasEth = (gwei * units * qty) / 1e9;
  const gasUsd = gasEth * ethUsd;
  const mintCost = mint * qty;
  const totalEth = mintCost + gasEth;
  const totalUsd = totalEth * ethUsd;
  const perMint = gasUsd / qty;
  return {
    gasCostEth: Number(gasEth.toFixed(6)),
    gasCostUsd: Number(gasUsd.toFixed(2)),
    mintCostEth: Number(mintCost.toFixed(4)),
    totalCostEth: Number(totalEth.toFixed(6)),
    totalCostUsd: Number(totalUsd.toFixed(2)),
    gasPerMintUsd: Number(perMint.toFixed(2)),
    explicacion: `Mint de ${qty} NFT a ${gwei} gwei × ${units} units: gas ${gasEth.toFixed(4)} ETH ($${gasUsd.toFixed(2)}). Mint price ${mintCost.toFixed(2)} ETH. Total ${totalEth.toFixed(4)} ETH = $${totalUsd.toFixed(2)}.`,
  };
}
