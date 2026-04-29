export interface Inputs {
  monthly_sales_ars: number;
  shopify_plan: string;
  tienda_nube_plan: string;
  payment_gateway_shopify: string;
  usd_mep_rate: number;
  conversion_rate: number;
}

export interface Outputs {
  shopify_monthly_cost: number;
  tienda_nube_monthly_cost: number;
  cost_difference: number;
  annual_savings: number;
  recommendation: string;
}

const SHOPIFY_PLANS_USD = {
  basic: 39,
  shopify: 105,
  advanced: 299
};

const TIENDA_NUBE_PLANS_ARS = {
  start: 299,
  gold: 999,
  platinum: 1999,
  diamond: 2999
};

const GATEWAY_RATES = {
  mercado_pago: { percentage: 0.0149, fixed_ars: 7 },
  stripe: { percentage: 0.029, fixed_usd: 0.30 },
  otro: { percentage: 0.02, fixed_ars: 0 }
};

const TIENDA_NUBE_COMMISSIONS = {
  start: 0.0299,
  gold: 0.0199,
  platinum: 0.0099,
  diamond: 0.0050
};

export function compute(i: Inputs): Outputs {
  const salesArs = Number(i.monthly_sales_ars) || 0;
  const shopifyPlan = String(i.shopify_plan) || 'basic';
  const tiendaNubePlan = String(i.tienda_nube_plan) || 'gold';
  const paymentGateway = String(i.payment_gateway_shopify) || 'mercado_pago';
  const mepRate = Number(i.usd_mep_rate) || 850;
  const conversionRate = Math.min(Math.max(Number(i.conversion_rate) || 0, 0), 100) / 100;

  if (salesArs <= 0 || mepRate <= 0) {
    return {
      shopify_monthly_cost: 0,
      tienda_nube_monthly_cost: 0,
      cost_difference: 0,
      annual_savings: 0,
      recommendation: 'Ingresa valores válidos: ventas > 0 y MEP > 0'
    };
  }

  const shopifyMonthlyUsd = SHOPIFY_PLANS_USD[shopifyPlan as keyof typeof SHOPIFY_PLANS_USD] || 39;
  const shopifyQuotaArs = shopifyMonthlyUsd * mepRate;

  const actualSalesConversion = salesArs * conversionRate;
  const gatewayConfig = GATEWAY_RATES[paymentGateway as keyof typeof GATEWAY_RATES] || GATEWAY_RATES['otro'];

  let shopifyCommission = actualSalesConversion * gatewayConfig.percentage;
  if (paymentGateway === 'stripe') {
    shopifyCommission += 0.30 * mepRate;
  } else if (gatewayConfig.fixed_ars) {
    shopifyCommission += gatewayConfig.fixed_ars;
  }

  const shopifyMonthlyCost = shopifyQuotaArs + shopifyCommission;

  const tiendaNuebaQuotaArs = TIENDA_NUBE_PLANS_ARS[tiendaNubePlan as keyof typeof TIENDA_NUBE_PLANS_ARS] || 999;
  const tiendaNuebaCommissionRate = TIENDA_NUBE_COMMISSIONS[tiendaNubePlan as keyof typeof TIENDA_NUBE_COMMISSIONS] || 0.0199;
  const tiendaNuebaCommission = actualSalesConversion * tiendaNuebaCommissionRate;
  const tiendaNuebaMonthlyCost = tiendaNuebaQuotaArs + tiendaNuebaCommission;

  const costDifference = shopifyMonthlyCost - tiendaNuebaMonthlyCost;
  const annualSavings = Math.abs(costDifference) * 12;

  let recommendation = '';
  if (costDifference > 0) {
    recommendation = `Tienda Nube es más económica. Ahorras ARS ${Math.round(annualSavings).toLocaleString('es-AR')} anuales. Usa Tienda Nube si vendes solo en Argentina.`;
  } else if (costDifference < 0) {
    recommendation = `Shopify es más económica. Ahorras ARS ${Math.round(annualSavings).toLocaleString('es-AR')} anuales. Usa Shopify si necesitas alcance global.`;
  } else {
    recommendation = 'Ambas plataformas tienen costo equivalente. Elige según funcionalidades que necesites.';
  }

  return {
    shopify_monthly_cost: Math.round(shopifyMonthlyCost * 100) / 100,
    tienda_nube_monthly_cost: Math.round(tiendaNuebaMonthlyCost * 100) / 100,
    cost_difference: Math.round(costDifference * 100) / 100,
    annual_savings: Math.round(annualSavings * 100) / 100,
    recommendation
  };
}
