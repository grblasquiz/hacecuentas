/** NFT royalties primary + secondary */
export interface Inputs { primarySales: number; primaryPrice: number; secondaryVolumeEth: number; royaltyPercent: number; marketplaceFeePercent: number; ethPriceUsd: number; }
export interface Outputs { primaryRevenueEth: number; secondaryRoyaltiesEth: number; totalRevenueEth: number; totalRevenueUsd: number; marketplaceFeePaid: number; explicacion: string; _chart?: any; }
export function nftRoyaltiesPrimarySecondary(i: Inputs): Outputs {
  const sales = Number(i.primarySales);
  const pp = Number(i.primaryPrice);
  const secondVol = Number(i.secondaryVolumeEth);
  const roy = Number(i.royaltyPercent) / 100;
  const mktFee = Number(i.marketplaceFeePercent) / 100;
  const ethUsd = Number(i.ethPriceUsd) || 3000;
  if (sales < 0) throw new Error('Primary sales inválido');
  const primaryRevenue = sales * pp;
  const mktFeePrimary = primaryRevenue * mktFee;
  const netPrimary = primaryRevenue - mktFeePrimary;
  const secondaryRoy = secondVol * roy;
  const total = netPrimary + secondaryRoy;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Venta primaria (neta)', value: Number(netPrimary.toFixed(4)) },
      { label: 'Royalties secundario', value: Number(secondaryRoy.toFixed(4)) },
    ],
    prefix: '',
    centerValue: total.toFixed(2) + ' ETH',
    centerLabel: 'Ingreso total',
    ariaLabel: 'Composición del ingreso total en ETH: venta primaria neta más royalties del mercado secundario',
  };
  return {
    primaryRevenueEth: Number(netPrimary.toFixed(4)),
    secondaryRoyaltiesEth: Number(secondaryRoy.toFixed(4)),
    totalRevenueEth: Number(total.toFixed(4)),
    totalRevenueUsd: Number((total * ethUsd).toFixed(2)),
    marketplaceFeePaid: Number(mktFeePrimary.toFixed(4)),
    explicacion: `Primary: ${sales}×${pp}ETH = ${primaryRevenue.toFixed(2)}ETH, fee ${(mktFee*100).toFixed(1)}% → ${netPrimary.toFixed(2)}ETH. Royalties ${(roy*100).toFixed(1)}% de ${secondVol}ETH = ${secondaryRoy.toFixed(2)}ETH. Total ${total.toFixed(2)}ETH = $${(total*ethUsd).toFixed(2)}.`,
    _chart: chart,
  };
}
