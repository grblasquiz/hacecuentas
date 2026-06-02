/** Leverage DeFi liquidation price */
export interface Inputs { collateralUsd: number; collateralPrice: number; borrowUsd: number; liquidationThreshold: number; }
export interface Outputs { liquidationPrice: number; healthFactor: number; currentLtv: number; maxBorrow: number; bufferPercent: number; explicacion: string; _insight?: any; _chart?: any; }
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
  let riesgo: string; let insTono: 'good' | 'warn' | 'neutral';
  if (hf < 1) { riesgo = 'en zona de liquidación'; insTono = 'warn'; }
  else if (hf < 1.5) { riesgo = 'en riesgo alto de liquidación'; insTono = 'warn'; }
  else if (hf < 2) { riesgo = 'en riesgo moderado'; insTono = 'neutral'; }
  else { riesgo = 'en zona segura'; insTono = 'good'; }
  const _insight = {
    title: 'Salud de la posición',
    text: `Tu **Health Factor es ${hf.toFixed(2)}** (${riesgo}). La liquidación se gatilla si el colateral cae a **$${liquidationPrice.toFixed(2)}**, un **${buffer.toFixed(1)}% por debajo** del precio actual de $${price}. LTV actual: **${currentLtv.toFixed(2)}%**.`,
    tone: insTono,
    icon: insTono === 'warn' ? '⚠️' : '🛡️',
  };
  const topBound = Math.max(3, Math.ceil(hf) + 1);
  const _chart = {
    type: 'scale',
    marker: Number(hf.toFixed(2)),
    markerLabel: `HF ${hf.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Liquidación', max: 1, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Riesgo alto', max: 1.5, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Moderado', max: 2, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Seguro', max: topBound, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Health Factor de ${hf.toFixed(2)} sobre una escala donde por debajo de 1 hay liquidación, hasta 1,5 riesgo alto, hasta 2 moderado y por encima zona segura.`,
  };
  return {
    liquidationPrice: Number(liquidationPrice.toFixed(4)),
    healthFactor: Number(hf.toFixed(3)),
    currentLtv: Number(currentLtv.toFixed(2)),
    maxBorrow: Number(maxBorrow.toFixed(2)),
    bufferPercent: Number(buffer.toFixed(2)),
    explicacion: `Con collateral $${col} (${tokens.toFixed(4)} tokens @ $${price}) y borrow $${borrow}, LTV ${currentLtv.toFixed(2)}%, liquidation threshold ${(lt*100).toFixed(1)}%: liquidation price $${liquidationPrice.toFixed(2)} (buffer ${buffer.toFixed(1)}%), HF ${hf.toFixed(2)}.`,
    _insight,
    _chart,
  };
}
