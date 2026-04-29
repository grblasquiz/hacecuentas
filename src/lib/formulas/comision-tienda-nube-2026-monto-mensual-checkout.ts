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
}

export function compute(i: Inputs): Outputs {
  const monthlySales = Number(i.monthly_sales) || 0;
  const ticketPromedio = Number(i.ticket_promedio) || 1;
  const planType = String(i.plan_type || 'crece');

  // Plan costs and commissions (ARS, 2026)
  const planData: Record<string, { cost: number; commission: number }> = {
    inicio: { cost: 14990, commission: 0.035 },
    crece: { cost: 24990, commission: 0.028 },
    prospera: { cost: 44990, commission: 0.02 },
    imperio: { cost: 69990, commission: 0 }
  };

  const selectedPlan = planData[planType] || planData['crece'];
  const planCost = selectedPlan.cost;
  const tnCommissionRate = selectedPlan.commission;

  // Mercado Pago commission (5.5% on total sales)
  const MERCADO_PAGO_RATE = 0.055;

  // Calculations
  const numTransactions = Math.round(monthlySales / ticketPromedio);
  const tnCommission = monthlySales * tnCommissionRate;
  const paymentProcessingFee = monthlySales * MERCADO_PAGO_RATE;
  const totalMonthlyCost = planCost + tnCommission + paymentProcessingFee;
  const costPercentage = monthlySales > 0 ? (totalMonthlyCost / monthlySales) * 100 : 0;
  const netRevenue = monthlySales - totalMonthlyCost;

  return {
    plan_cost: Math.round(planCost * 100) / 100,
    num_transactions: numTransactions,
    tn_commission: Math.round(tnCommission * 100) / 100,
    payment_processing_fee: Math.round(paymentProcessingFee * 100) / 100,
    total_monthly_cost: Math.round(totalMonthlyCost * 100) / 100,
    cost_percentage: Math.round(costPercentage * 100) / 100,
    net_revenue: Math.round(netRevenue * 100) / 100
  };
}
