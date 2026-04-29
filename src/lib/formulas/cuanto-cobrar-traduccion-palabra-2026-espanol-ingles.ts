export interface Inputs {
  word_count: number;
  experience_level: string;
  direction: string;
  content_type: string;
}

export interface Outputs {
  total_fee: number;
  rate_per_word: number;
  hourly_equivalent: number;
  estimated_hours: number;
  rate_range: string;
}

export function compute(i: Inputs): Outputs {
  const wordCount = Number(i.word_count) || 0;
  
  if (wordCount <= 0) {
    return {
      total_fee: 0,
      rate_per_word: 0,
      hourly_equivalent: 0,
      estimated_hours: 0,
      rate_range: "Ingresá una cantidad válida de palabras"
    };
  }

  // Base rates by experience (USD per word) - 2026
  const baseRates: { [key: string]: { min: number; max: number; midpoint: number; speed: number } } = {
    junior: { min: 0.04, max: 0.06, midpoint: 0.05, speed: 225 },
    mid: { min: 0.08, max: 0.12, midpoint: 0.10, speed: 325 },
    senior: { min: 0.15, max: 0.25, midpoint: 0.20, speed: 375 },
    specialist: { min: 0.20, max: 0.40, midpoint: 0.30, speed: 225 }
  };

  // Content type multipliers
  const contentMultipliers: { [key: string]: number } = {
    general: 1.0,
    technical: 1.2,
    legal: 1.4,
    medical: 1.4
  };

  // Direction adjustment
  const directionMultiplier = (i.direction === "es_to_en") ? 1.08 : 1.0;

  const experience = i.experience_level || "mid";
  const contentType = i.content_type || "general";
  
  const baseRate = baseRates[experience]?.midpoint || 0.10;
  const contentMult = contentMultipliers[contentType] || 1.0;
  
  const ratePerWord = baseRate * contentMult * directionMultiplier;
  const totalFee = ratePerWord * wordCount;
  const speed = baseRates[experience]?.speed || 300;
  const estimatedHours = wordCount / speed;
  const hourlyEquivalent = estimatedHours > 0 ? totalFee / estimatedHours : 0;

  // Rate range for this profile
  const baseMin = baseRates[experience]?.min || 0.08;
  const baseMax = baseRates[experience]?.max || 0.12;
  const minRate = baseMin * contentMult * directionMultiplier;
  const maxRate = baseMax * contentMult * directionMultiplier;
  const minTotal = minRate * wordCount;
  const maxTotal = maxRate * wordCount;
  
  const rateRangeText = `USD ${minRate.toFixed(3)}-${maxRate.toFixed(3)}/palabra (Total: USD ${minTotal.toFixed(0)}-${maxTotal.toFixed(0)})`;

  return {
    total_fee: Math.round(totalFee * 100) / 100,
    rate_per_word: Math.round(ratePerWord * 1000) / 1000,
    hourly_equivalent: Math.round(hourlyEquivalent * 100) / 100,
    estimated_hours: Math.round(estimatedHours * 10) / 10,
    rate_range: rateRangeText
  };
}
