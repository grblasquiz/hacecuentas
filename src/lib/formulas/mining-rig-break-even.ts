/** Mining rig break-even */
export interface Inputs { hardwareCostUsd: number; monthlyProfitUsd: number; monthlyMaintUsd: number; depreciationRatePercent: number; }
export interface Outputs { paybackMonths: number; paybackYears: number; totalProfitYear1: number; residualValue: number; roi1Year: number; explicacion: string; }
export function miningRigBreakEven(i: Inputs): Outputs {
  const cost = Number(i.hardwareCostUsd);
  const monthlyProfit = Number(i.monthlyProfitUsd);
  const maint = Number(i.monthlyMaintUsd) || 0;
  const depRate = Number(i.depreciationRatePercent) / 100;
  if (!cost || cost <= 0) throw new Error('Ingresá costo hardware');
  if (monthlyProfit <= maint) throw new Error('Profit mensual debe superar maintenance');
  const net = monthlyProfit - maint;
  const payback = cost / net;
  const y = payback / 12;
  const year1 = net * 12;
  const residual = cost * (1 - depRate);
  const roi = ((year1 - cost + residual) / cost) * 100;
  return {
    paybackMonths: Number(payback.toFixed(1)),
    paybackYears: Number(y.toFixed(2)),
    totalProfitYear1: Number(year1.toFixed(2)),
    residualValue: Number(residual.toFixed(2)),
    roi1Year: Number(roi.toFixed(2)),
    explicacion: `Hardware $${cost}, profit neto $${net}/mes: payback ${payback.toFixed(1)} meses. Profit año 1: $${year1.toFixed(2)}. Valor residual: $${residual.toFixed(2)}. ROI año 1: ${roi.toFixed(1)}%.`,
  };
}
