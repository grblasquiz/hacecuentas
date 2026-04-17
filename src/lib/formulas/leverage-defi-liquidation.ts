/** Leverage DeFi liquidation price */
export interface Inputs { collateralUsd: number; collateralPrice: number; borrowUsd: number; liquidationThreshold: number; }
export interface Outputs { liquidationPrice: number; healthFactor: number; currentLtv: number; maxBorrow: number; bufferPercent: number; explicacion: string; }
export function leverageDefiLiquidation(i: Inputs): Outputs {
  const col = Number(i.collateralUsd);
  const price = Number(i.collateralPrice);
  const borrow = Number(i.borrowUsd);
  const lt = Number(i.liquidationThreshold) / 100;
  if (!col || col <= 0) throw new Error('Ingresá collateral');
  if (!price || price <= 0) throw new Error('Precio collateral');
  if (!lt || lt <= 0 || lt >= 1) throw new Error('Liquidation threshold inválido');
  const tokens = col / price;
  const liquidationPrice = borrow / (tokens * lt);
  const hf = (col * lt) / borrow;
  const currentLtv = (borrow / col) * 100;
  const maxBorrow = col * lt;
  const buffer = ((price - liquidationPrice) / price) * 100;
  return {
    liquidationPrice: Number(liquidationPrice.toFixed(4)),
    healthFactor: Number(hf.toFixed(3)),
    currentLtv: Number(currentLtv.toFixed(2)),
    maxBorrow: Number(maxBorrow.toFixed(2)),
    bufferPercent: Number(buffer.toFixed(2)),
    explicacion: `Con collateral $${col} (${tokens.toFixed(4)} tokens @ $${price}) y borrow $${borrow}, LTV ${currentLtv.toFixed(2)}%, liquidation threshold ${(lt*100).toFixed(1)}%: liquidation price $${liquidationPrice.toFixed(2)} (buffer ${buffer.toFixed(1)}%), HF ${hf.toFixed(2)}.`,
  };
}
