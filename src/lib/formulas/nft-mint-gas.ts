/** NFT mint gas cost */
export interface Inputs { gasPriceGwei: number; gasUnitsMint: number; ethPriceUsd: number; mintPriceEth: number; quantity: number; }
export interface Outputs { gasCostEth: number; gasCostUsd: number; mintCostEth: number; totalCostEth: number; totalCostUsd: number; gasPerMintUsd: number; explicacion: string; _chart?: any; _insight?: any; }
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
  const gasShare = totalEth > 0 ? (gasEth / totalEth) * 100 : 0;
  const insight = {
    title: 'Peso del gas en tu mint',
    text: gasShare >= 50
      ? `El gas representa **${gasShare.toFixed(0)}%** del costo total (**$${gasUsd.toFixed(2)}** de $${totalUsd.toFixed(2)}): estás pagando más en comisiones de red que en el NFT. Conviene mintear cuando el gwei esté más bajo.`
      : `Vas a pagar **$${gasUsd.toFixed(2)}** de gas (**${gasShare.toFixed(0)}%** del total), o sea **$${perMint.toFixed(2)}** por cada NFT. El costo total del mint es **$${totalUsd.toFixed(2)}**.`,
    tone: gasShare >= 50 ? 'warn' : 'neutral',
    icon: '⛽',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Precio mint', value: Number(mintCost.toFixed(6)) },
      { label: 'Gas', value: Number(gasEth.toFixed(6)) },
    ],
    prefix: '',
    centerValue: totalEth.toFixed(4) + ' ETH',
    centerLabel: 'Total',
    ariaLabel: 'Composición del costo total en ETH: precio de mint más gas',
  };
  return {
    gasCostEth: Number(gasEth.toFixed(6)),
    gasCostUsd: Number(gasUsd.toFixed(2)),
    mintCostEth: Number(mintCost.toFixed(4)),
    totalCostEth: Number(totalEth.toFixed(6)),
    totalCostUsd: Number(totalUsd.toFixed(2)),
    gasPerMintUsd: Number(perMint.toFixed(2)),
    explicacion: `Mint de ${qty} NFT a ${gwei} gwei × ${units} units: gas ${gasEth.toFixed(4)} ETH ($${gasUsd.toFixed(2)}). Mint price ${mintCost.toFixed(2)} ETH. Total ${totalEth.toFixed(4)} ETH = $${totalUsd.toFixed(2)}.`,
    _chart: chart,
    _insight: insight,
  };
}
