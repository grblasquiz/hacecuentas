/** NFT floor price portfolio */
export interface Inputs { quantity: number; floorPriceEth: number; costBasisEth: number; ethPriceUsd: number; marketplaceFeePercent: number; royaltyPercent: number; }
export interface Outputs { floorValueEth: number; floorValueUsd: number; unrealizedPnlEth: number; unrealizedPnlUsd: number; netSellableUsd: number; pnlPercent: number; explicacion: string; }
export function nftFloorPricePortfolio(i: Inputs): Outputs {
  const qty = Number(i.quantity);
  const floor = Number(i.floorPriceEth);
  const cost = Number(i.costBasisEth);
  const ethUsd = Number(i.ethPriceUsd);
  const mktFee = Number(i.marketplaceFeePercent) / 100;
  const roy = Number(i.royaltyPercent) / 100;
  if (!qty || qty <= 0) throw new Error('Cantidad NFTs');
  if (!floor || floor < 0) throw new Error('Floor price');
  const floorValue = qty * floor;
  const totalCost = qty * cost;
  const unrealized = floorValue - totalCost;
  const floorUsd = floorValue * ethUsd;
  const pnlUsd = unrealized * ethUsd;
  const netSell = floorValue * (1 - mktFee - roy);
  const netUsd = netSell * ethUsd;
  const pnlPerc = totalCost > 0 ? (unrealized / totalCost) * 100 : 0;
  return {
    floorValueEth: Number(floorValue.toFixed(4)),
    floorValueUsd: Number(floorUsd.toFixed(2)),
    unrealizedPnlEth: Number(unrealized.toFixed(4)),
    unrealizedPnlUsd: Number(pnlUsd.toFixed(2)),
    netSellableUsd: Number(netUsd.toFixed(2)),
    pnlPercent: Number(pnlPerc.toFixed(2)),
    explicacion: `${qty} NFTs × floor ${floor}ETH = ${floorValue.toFixed(2)}ETH ($${floorUsd.toFixed(2)}). Cost basis ${totalCost.toFixed(2)}ETH. PnL unrealized ${unrealized.toFixed(2)}ETH ($${pnlUsd.toFixed(2)}, ${pnlPerc.toFixed(1)}%). Vendiendo neto $${netUsd.toFixed(2)}.`,
  };
}
