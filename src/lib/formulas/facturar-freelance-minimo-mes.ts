/** Facturacion minima freelance mes */
export interface Inputs { gastosPersonales: number; gastosTrabajo: number; ahorroObjetivo: number; impuestosPct: number; }
export interface Outputs { facturacionMinima: number; facturacionAnual: number; netoMensual: number; totalGastos: number; _insight?: any; _chart?: any; }
export function facturarFreelanceMinimoMes(i: Inputs): Outputs {
  const gp = Number(i.gastosPersonales);
  const gt = Number(i.gastosTrabajo);
  const ah = Number(i.ahorroObjetivo);
  const imp = Number(i.impuestosPct) / 100;
  if (gp < 0 || gt < 0 || ah < 0) throw new Error('Valores inválidos');
  if (imp >= 1) throw new Error('Impuestos debe ser menor al 100%');
  const neto = gp + gt + ah;
  const bruta = neto / (1 - imp);
  const impuestosMonto = bruta - neto;
  const brutaR = Math.round(bruta);
  const impPct = (imp * 100).toFixed(0);

  const insight = {
    title: 'Cuánto facturar para vivir',
    text: `Necesitás facturar **$${brutaR.toLocaleString()}/mes** para cubrir tus gastos, ahorrar y pagar impuestos. De ese bruto, **$${Math.round(impuestosMonto).toLocaleString()}** (**${impPct}%**) se van en impuestos y te quedan **$${Math.round(neto).toLocaleString()}** netos. En el año, son **$${Math.round(bruta * 12).toLocaleString()}**.`,
    tone: (imp >= 0.35 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🧾'
  };

  const slices = [
    { label: 'Gastos personales', value: Math.round(gp) },
    { label: 'Gastos de trabajo', value: Math.round(gt) },
    { label: 'Ahorro', value: Math.round(ah) },
    { label: 'Impuestos', value: Math.round(impuestosMonto) }
  ].filter(s => s.value > 0);

  const chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: `$${brutaR.toLocaleString()}`,
    centerLabel: 'Facturación/mes',
    ariaLabel: `Desglose de la facturación mínima de $${brutaR.toLocaleString()} mensuales entre gastos, ahorro e impuestos`
  };

  return {
    facturacionMinima: Math.round(bruta),
    facturacionAnual: Math.round(bruta * 12),
    netoMensual: Math.round(neto),
    totalGastos: Math.round(gp + gt),
    _insight: insight,
    _chart: chart
  };
}
