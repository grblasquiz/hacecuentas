export interface Inputs {
  gestational_age_weeks: number;
  percentile: string;
}

export interface Outputs {
  weight_grams: number;
  weight_pounds: number;
  growth_category: string;
  normal_range: string;
}

// Hadlock regression curves: weight (grams) by gestational week and percentile
// Source: Hadlock FP et al. Radiology 1984; 150(2):535-540
// Data interpolated for weeks 20-40, percentiles 10/25/50/75/90
const HADLOCK_CURVES: Record<number, Record<string, number>> = {
  20: { '10': 320, '25': 360, '50': 420, '75': 480, '90': 540 },
  21: { '10': 380, '25': 430, '50': 500, '75': 570, '90': 640 },
  22: { '10': 450, '25': 510, '50': 590, '75': 670, '90': 750 },
  23: { '10': 530, '25': 600, '50': 690, '75': 780, '90': 880 },
  24: { '10': 620, '25': 700, '50': 810, '75': 910, '90': 1020 },
  25: { '10': 720, '25': 815, '50': 940, '75': 1060, '90': 1190 },
  26: { '10': 830, '25': 945, '50': 1080, '75': 1220, '90': 1370 },
  27: { '10': 950, '25': 1080, '50': 1240, '75': 1400, '90': 1570 },
  28: { '10': 1080, '25': 1230, '50': 1410, '75': 1600, '90': 1800 },
  29: { '10': 1220, '25': 1390, '50': 1590, '75': 1820, '90': 2050 },
  30: { '10': 1370, '25': 1560, '50': 1780, '75': 2050, '90': 2320 },
  31: { '10': 1530, '25': 1740, '50': 1980, '75': 2290, '90': 2610 },
  32: { '10': 1700, '25': 1930, '50': 2190, '75': 2540, '90': 2920 },
  33: { '10': 1880, '25': 2130, '50': 2410, '75': 2800, '90': 3240 },
  34: { '10': 2070, '25': 2340, '50': 2640, '75': 3070, '90': 3570 },
  35: { '10': 2270, '25': 2560, '50': 2880, '75': 3350, '90': 3900 },
  36: { '10': 2480, '25': 2790, '50': 3120, '75': 3640, '90': 4230 },
  37: { '10': 2700, '25': 3030, '50': 3370, '75': 3930, '90': 4560 },
  38: { '10': 2930, '25': 3280, '50': 3620, '75': 4220, '90': 4890 },
  39: { '10': 3170, '25': 3530, '50': 3870, '75': 4510, '90': 5220 },
  40: { '10': 3410, '25': 3790, '50': 4120, '75': 4800, '90': 5550 },
};

function interpolateWeight(weeks: number, percentile: string): number {
  // Clamp weeks to valid range
  if (weeks < 20) {
    return 0; // Out of range
  }
  if (weeks > 40) {
    weeks = 40;
  }

  const wholeWeeks = Math.floor(weeks);
  const fraction = weeks - wholeWeeks;

  // Check if we have exact week data
  if (HADLOCK_CURVES[wholeWeeks] && HADLOCK_CURVES[wholeWeeks][percentile]) {
    const weight1 = HADLOCK_CURVES[wholeWeeks][percentile];
    
    // Linear interpolation if fractional weeks and next week exists
    if (fraction > 0 && HADLOCK_CURVES[wholeWeeks + 1] && HADLOCK_CURVES[wholeWeeks + 1][percentile]) {
      const weight2 = HADLOCK_CURVES[wholeWeeks + 1][percentile];
      return weight1 + (weight2 - weight1) * fraction;
    }
    return weight1;
  }

  return 0;
}

function getNormalRange(weeks: number): string {
  const wholeWeeks = Math.floor(weeks);
  
  if (wholeWeeks < 20 || wholeWeeks > 40) {
    return 'Out of range (20-40 weeks)';
  }

  const data = HADLOCK_CURVES[wholeWeeks];
  if (!data) {
    return 'No data available';
  }

  const p25 = data['25'];
  const p75 = data['75'];
  const p25_lb = (p25 / 453.592).toFixed(1);
  const p75_lb = (p75 / 453.592).toFixed(1);

  return `${p25}g (${p25_lb}lb) – ${p75}g (${p75_lb}lb)`;
}

export function compute(i: Inputs): Outputs {
  const weeks = Number(i.gestational_age_weeks) || 0;
  const percentile = String(i.percentile || '50');

  // Validation
  if (weeks < 20 || weeks > 40) {
    return {
      weight_grams: 0,
      weight_pounds: 0,
      growth_category: 'Gestational age must be 20–40 weeks for Hadlock formula',
      normal_range: 'Out of range',
    };
  }

  const weightGrams = interpolateWeight(weeks, percentile);

  if (weightGrams === 0) {
    return {
      weight_grams: 0,
      weight_pounds: 0,
      growth_category: 'Invalid percentile or gestational age',
      normal_range: 'Check inputs',
    };
  }

  const weightPounds = weightGrams / 453.592;

  // Determine growth category based on percentile
  let category = '';
  if (percentile === '10') {
    category = 'Small for Gestational Age (SGA) – <10th percentile';
  } else if (percentile === '25') {
    category = 'Low-normal – 25th percentile';
  } else if (percentile === '50') {
    category = 'Median – 50th percentile (normal)';
  } else if (percentile === '75') {
    category = 'High-normal – 75th percentile';
  } else if (percentile === '90') {
    category = 'Large for Gestational Age (LGA) – >90th percentile';
  }

  const normalRange = getNormalRange(weeks);

  return {
    weight_grams: Math.round(weightGrams),
    weight_pounds: parseFloat(weightPounds.toFixed(2)),
    growth_category: category,
    normal_range: normalRange,
  };
}
