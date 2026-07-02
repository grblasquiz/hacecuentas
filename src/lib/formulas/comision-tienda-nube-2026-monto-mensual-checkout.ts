export interface Inputs {
  monthly_sales: number;
  plan_type: string;
  ticket_promedio: number;
}

export interface Outputs {
  plan_cost: number;
  num_transactions: number;
  tn_commission: number;
  payment_processing_fee: number;
  total_monthly_cost: number;
  cost_percentage: number;
  net_revenue: number;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const monthlySales = Number(i.monthly_sales) || 0;
  const ticketPromedio = Number(i.ticket_promedio) || 1;
  const planType = String(i.plan_type || 'esencial');

  // Plan costs and transaction fees (ARS, tarifa oficial tiendanube.com/planes-y-precios, julio 2026)
  // Costo por transacción aplica cobrando con medios de pago externos (con Pago Nube se bonifica).
  const planData: Record<string, { cost: number; commission: number }> = {
    inicial: { cost: 0, commission: 0.02 },
    esencial: { cost: 26999, commission: 0.01 },
    impulso: { cost: 78999, commission: 0.007 },
    escala: { cost: 234999, commission: 0 }
  };

  const selectedPlan = planData[planType] || planData['esencial'];
  const planCost = selectedPlan.cost;
  const tnCommissionRate = selectedPlan.commission;

  // Mercado Pago Checkout: 4,99% + IVA ≈ 6,04% efectivo (acreditación inmediata, jul-2026)
  const MERCADO_PAGO_RATE = 0.0604;

  // Calculations
  const numTransactions = Math.round(monthlySales / ticketPromedio);
  const tnCommission = monthlySales * tnCommissionRate;
  const paymentProcessingFee = monthlySales * MERCADO_PAGO_RATE;
  const totalMonthlyCost = planCost + tnCommission + paymentProcessingFee;
  const costPercentage = monthlySales > 0 ? (totalMonthlyCost / monthlySales) * 100 : 0;
  const netRevenue = monthlySales - totalMonthlyCost;

  // Donut: descomposición del costo mensual total en sus tres componentes.
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Abono del plan', value: Math.max(0, Math.round(planCost)) },
      { label: 'Comisión Tienda Nube', value: Math.max(0, Math.round(tnCommission)) },
      { label: 'Procesamiento Mercado Pago', value: Math.max(0, Math.round(paymentProcessingFee)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalMonthlyCost).toLocaleString('es-AR'),
    centerLabel: 'Costo/mes',
    ariaLabel: 'Composición del costo mensual de Tienda Nube: abono del plan, comisión de la plataforma y procesamiento de pagos.',
  };

  // Insight: peso del costo total sobre las ventas e identificación del componente dominante.
  const fmtTN = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const componentes = [
    { label: 'el abono del plan', value: planCost },
    { label: 'la comisión de Tienda Nube', value: tnCommission },
    { label: 'el procesamiento de Mercado Pago', value: paymentProcessingFee },
  ];
  const mayor = componentes.reduce((a, b) => (b.value > a.value ? b : a));
  const insight = {
    title: 'Cuánto te come Tienda Nube',
    text: `Entre plan, comisión y Mercado Pago, los costos se llevan el **${costPercentage.toFixed(1)}%** de tus ventas: de **${fmtTN(monthlySales)}** te quedan **${fmtTN(netRevenue)}** netos. El componente más pesado es **${mayor.label}** con **${fmtTN(mayor.value)}**.`,
    tone: (costPercentage >= 9 ? 'warn' : costPercentage > 0 ? 'neutral' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '🛒',
  };

  return {
    plan_cost: Math.round(planCost * 100) / 100,
    num_transactions: numTransactions,
    tn_commission: Math.round(tnCommission * 100) / 100,
    payment_processing_fee: Math.round(paymentProcessingFee * 100) / 100,
    total_monthly_cost: Math.round(totalMonthlyCost * 100) / 100,
    cost_percentage: Math.round(costPercentage * 100) / 100,
    net_revenue: Math.round(netRevenue * 100) / 100,
    _chart: chart,
    _insight: insight
  };
}
