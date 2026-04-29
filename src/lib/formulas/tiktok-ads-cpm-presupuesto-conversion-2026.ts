export interface Inputs {
  budget: number;
  region: string;
  cpm: number;
  campaign_days: number;
  ctr: number;
  conversion_rate: number;
  audience_type: string;
}

export interface Outputs {
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cac: number;
  cost_per_impression: number;
  comparison_meta: number;
  comparison_google: number;
  daily_budget: number;
}

export function compute(i: Inputs): Outputs {
  const budget = Number(i.budget) || 0;
  const cpm = Number(i.cpm) || 5;
  const campaign_days = Number(i.campaign_days) || 7;
  const ctr = Number(i.ctr) || 3;
  const conversion_rate = Number(i.conversion_rate) || 2;

  // Audience type multiplier (efficiency adjustment)
  const audienceMultipliers: { [key: string]: number } = {
    broad: 1.0,
    interest: 1.2,
    lookalike: 1.5,
    retargeting: 1.8
  };
  const audience_multiplier = audienceMultipliers[i.audience_type] || 1.0;

  // Regional CPM defaults (for reference, but use input cpm)
  const cpm_meta = i.region === 'latam' ? 8 : i.region === 'usa' ? 12 : i.region === 'europe' ? 14 : 4;
  const cpm_google = i.region === 'latam' ? 12 : i.region === 'usa' ? 16 : i.region === 'europe' ? 18 : 6;

  // Calculate base impressions
  const impressions_base = (budget / cpm) * 1000;
  const impressions = impressions_base * audience_multiplier;

  // Calculate clicks and conversions
  const clicks = impressions * (ctr / 100);
  const conversions = clicks * (conversion_rate / 100);

  // Calculate costs
  const cpc = clicks > 0 ? budget / clicks : 0;
  const cac = conversions > 0 ? budget / conversions : 0;
  const cost_per_impression = impressions > 0 ? budget / impressions : 0;

  // Comparison with Meta and Google
  const comparison_meta = ((cpm_meta - cpm) / cpm_meta) * budget;
  const comparison_google = ((cpm_google - cpm) / cpm_google) * budget;

  // Daily budget
  const daily_budget = campaign_days > 0 ? budget / campaign_days : 0;

  return {
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    conversions: Math.round(conversions),
    cpc: parseFloat(cpc.toFixed(2)),
    cac: parseFloat(cac.toFixed(2)),
    cost_per_impression: parseFloat(cost_per_impression.toFixed(4)),
    comparison_meta: parseFloat(comparison_meta.toFixed(2)),
    comparison_google: parseFloat(comparison_google.toFixed(2)),
    daily_budget: parseFloat(daily_budget.toFixed(2))
  };
}
