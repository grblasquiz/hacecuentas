/** Mining rig break-even */
export interface Inputs { hardwareCostUsd: number; monthlyProfitUsd: number; monthlyMaintUsd: number; depreciationRatePercent: number; }
export interface Outputs { paybackMonths: number; paybackYears: number; totalProfitYear1: number; residualValue: number; roi1Year: number; explicacion: string; _insight?: any; _chart?: any; }
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

  const pm = Number(payback.toFixed(1));
  let tone: 'good' | 'warn' | 'neutral';
  let veredicto: string;
  if (pm <= 12) { tone = 'good'; veredicto = `recuperás la inversión en menos de un año y el ROI al año 1 es de **${roi.toFixed(0)}%**: el rig se paga rápido.`; }
  else if (pm <= 24) { tone = 'neutral'; veredicto = `recuperás la inversión en algo más de un año (ROI año 1: **${roi.toFixed(0)}%**): payback razonable, pero atento a la dificultad y al precio.`; }
  else { tone = 'warn'; veredicto = `tardás más de 2 años en recuperar el hardware (ROI año 1: **${roi.toFixed(0)}%**): payback largo, sensible a caídas de precio o subas de dificultad.`; }
  const ultimoMax = Math.max(36, Math.ceil(pm) + 3);

  return {
    paybackMonths: pm,
    paybackYears: Number(y.toFixed(2)),
    totalProfitYear1: Number(year1.toFixed(2)),
    residualValue: Number(residual.toFixed(2)),
    roi1Year: Number(roi.toFixed(2)),
    explicacion: `Hardware $${cost}, profit neto $${net}/mes: payback ${payback.toFixed(1)} meses. Profit año 1: $${year1.toFixed(2)}. Valor residual: $${residual.toFixed(2)}. ROI año 1: ${roi.toFixed(1)}%.`,
    _insight: {
      title: 'Cuánto tardás en recuperar',
      text: `Con un profit neto de **$${net}/mes**, el rig se paga en **${pm} meses** (${(pm / 12).toFixed(1)} años): ${veredicto}`,
      tone,
      icon: '⚙️'
    },
    _chart: {
      type: 'scale',
      marker: pm,
      markerLabel: `${pm} meses`,
      min: 0,
      segments: [
        { nombre: 'Rápido', max: 12, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Moderado', max: 24, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Lento', max: ultimoMax, color: '#ef4444', colorDark: '#dc2626' }
      ],
      ariaLabel: `Tiempo de recupero: ${pm} meses sobre una escala de payback`
    },
  };
}
