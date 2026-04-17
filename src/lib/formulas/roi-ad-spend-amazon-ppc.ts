/** ROI Amazon PPC */
export interface Inputs { adSpend: number; ventasAttributed: number; ventasTotales: number; costoProductoPct: number; }
export interface Outputs { acos: number; tacos: number; roas: number; breakevenAcos: number; profitNeto: number; }
export function roiAdSpendAmazonPpc(i: Inputs): Outputs {
  const spend = Number(i.adSpend);
  const ventasAd = Number(i.ventasAttributed);
  const ventasTot = Number(i.ventasTotales);
  const costoPct = Number(i.costoProductoPct) / 100;
  if (spend < 0 || ventasAd < 0 || ventasTot < 0) throw new Error('Valores inválidos');
  const acos = ventasAd > 0 ? (spend / ventasAd) * 100 : 0;
  const tacos = ventasTot > 0 ? (spend / ventasTot) * 100 : 0;
  const roas = spend > 0 ? ventasAd / spend : 0;
  const breakeven = (1 - costoPct) * 100;
  const margenBruto = ventasAd * (1 - costoPct);
  const profit = margenBruto - spend;
  return {
    acos: Number(acos.toFixed(2)),
    tacos: Number(tacos.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    breakevenAcos: Number(breakeven.toFixed(2)),
    profitNeto: Math.round(profit)
  };
}
