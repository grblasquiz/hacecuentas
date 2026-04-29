export interface Inputs {
  budget_usd: number;
  objective: string;
  cpm_usd: number;
  ctr_percent: number;
  cr_percent: number;
  value_per_conversion: number;
  duration_days: number;
  target_audience_size: number;
}

export interface Outputs {
  total_impressions: number;
  estimated_reach: number;
  total_clicks: number;
  total_conversions: number;
  cac: number;
  revenue_generated: number;
  net_profit: number;
  roas: number;
  recommendation: string;
}

export function compute(i: Inputs): Outputs {
  const budget = Number(i.budget_usd) || 0;
  const objective = String(i.objective) || 'conversion';
  const cpm = Number(i.cpm_usd) || 8;
  const ctrPercent = Number(i.ctr_percent) || 1;
  const crPercent = Number(i.cr_percent) || 2;
  const valuePerConversion = Number(i.value_per_conversion) || 50;
  const durationDays = Number(i.duration_days) || 30;
  const targetAudienceSize = Number(i.target_audience_size) || 500000;

  if (budget <= 0 || cpm <= 0 || ctrPercent <= 0 || crPercent <= 0 || valuePerConversion <= 0) {
    return {
      total_impressions: 0,
      estimated_reach: 0,
      total_clicks: 0,
      total_conversions: 0,
      cac: 0,
      revenue_generated: 0,
      net_profit: 0,
      roas: 0,
      recommendation: 'Verifica que todos los valores sean mayores a 0.'
    };
  }

  // Calcular impresiones totales
  const totalImpressions = Math.round((budget / cpm) * 1000);

  // Calcular alcance estimado (factor 15-25% según objetivo)
  let reachFactor = 0.2; // 20% por defecto
  if (objective === 'reach') {
    reachFactor = 0.25; // Más alcance para objetivo de alcance
  } else if (objective === 'conversion') {
    reachFactor = 0.18; // Menos alcance, más frecuencia para conversión
  }
  const estimatedReach = Math.round(totalImpressions * reachFactor);
  const actualReach = Math.min(estimatedReach, targetAudienceSize);

  // Calcular clics
  const totalClicks = Math.round(totalImpressions * (ctrPercent / 100));

  // Calcular conversiones
  const totalConversions = Math.round(totalClicks * (crPercent / 100));

  // Calcular CAC
  const cac = totalConversions > 0 ? budget / totalConversions : 0;

  // Calcular ingresos generados
  const revenueGenerated = totalConversions * valuePerConversion;

  // Calcular ganancia neta
  const netProfit = revenueGenerated - budget;

  // Calcular ROAS
  const roas = budget > 0 ? revenueGenerated / budget : 0;

  // Generar recomendación basada en ROAS
  let recommendation = '';
  if (roas < 1) {
    recommendation = '⚠️ ROAS crítico. Suspende o reformula el creativo urgentemente. Aumenta CR o reduce CPM.';
  } else if (roas < 2) {
    recommendation = '⚠️ ROAS marginal (< 2:1). Mejora landing page, A/B test creativo, reduce CPM o aumenta precio de producto.';
  } else if (roas < 3) {
    recommendation = '✓ ROAS aceptable (2-3:1). Monitorea diariamente, optimiza creativo y audience. Escalable con cuidado.';
  } else if (roas < 5) {
    recommendation = '✓✓ ROAS rentable (3-5:1). Excelente desempeño. Aumenta presupuesto gradualmente 15-20% por semana.';
  } else {
    recommendation = '✓✓✓ ROAS excepcional (> 5:1). Máximo desempeño. Escalá agresivamente; considera aumentar presupuesto 30-50%.';
  }

  // Ajustes por objetivo
  if (objective === 'reach') {
    recommendation += ' Objetivo: Alcance. Prioriza cobertura sobre conversión inmediata.';
  } else if (objective === 'engagement') {
    recommendation += ' Objetivo: Engagement. Monitorea likes, comentarios y compartidos; CR puede ser más bajo pero valioso para brand awareness.';
  }

  return {
    total_impressions: totalImpressions,
    estimated_reach: actualReach,
    total_clicks: totalClicks,
    total_conversions: totalConversions,
    cac: Math.round(cac * 100) / 100,
    revenue_generated: Math.round(revenueGenerated * 100) / 100,
    net_profit: Math.round(netProfit * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    recommendation: recommendation
  };
}
