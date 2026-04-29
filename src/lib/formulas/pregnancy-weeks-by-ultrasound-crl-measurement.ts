export interface Inputs {
  crl_mm: number;
  lmp_date: string | null;
}

export interface Outputs {
  gestational_weeks: string;
  edd_from_ultrasound: string;
  edd_from_lmp: string;
  dating_discrepancy_days: number;
  discrepancy_assessment: string;
}

export function compute(i: Inputs): Outputs {
  const crl = Number(i.crl_mm) || 0;
  
  // Validate CRL range (8–14 weeks typical: 10–90 mm)
  if (crl < 8 || crl > 100) {
    return {
      gestational_weeks: "Invalid CRL",
      edd_from_ultrasound: "",
      edd_from_lmp: "",
      dating_discrepancy_days: 0,
      discrepancy_assessment: "CRL should be 8–100 mm. Formula most accurate 10–90 mm (8–14 weeks)."
    };
  }
  
  // Hadlock formula: GA (weeks) = 8.052 * sqrt(CRL_mm) + 23.73
  const HADLOCK_A = 8.052;
  const HADLOCK_B = 23.73;
  const ga_weeks_decimal = HADLOCK_A * Math.sqrt(crl) + HADLOCK_B;
  
  // Convert to weeks + days
  const ga_weeks = Math.floor(ga_weeks_decimal / 7);
  const ga_days = Math.round((ga_weeks_decimal % 7));
  
  // Calculate EDD from ultrasound: today + (280 days - ga_days_total)
  const today = new Date();
  const ga_days_total = ga_weeks * 7 + ga_days;
  const remaining_days = 280 - ga_days_total;
  const edd_ultrasound = new Date(today.getTime() + remaining_days * 24 * 60 * 60 * 1000);
  
  let edd_lmp_str = "";
  let lmp_ga_days = 0;
  let discrepancy = 0;
  let assessment = "";
  
  // If LMP provided, calculate LMP-based EDD and discrepancy
  if (i.lmp_date && i.lmp_date.trim() !== "") {
    const lmp = new Date(i.lmp_date);
    const ms_per_day = 24 * 60 * 60 * 1000;
    const ms_since_lmp = today.getTime() - lmp.getTime();
    lmp_ga_days = Math.round(ms_since_lmp / ms_per_day);
    
    // EDD from LMP: LMP + 280 days
    const edd_lmp_date = new Date(lmp.getTime() + 280 * ms_per_day);
    edd_lmp_str = edd_lmp_date.toISOString().split('T')[0];
    
    // Discrepancy in days: ultrasound GA - LMP GA
    discrepancy = ga_days_total - lmp_ga_days;
    
    if (Math.abs(discrepancy) <= 7) {
      assessment = `Concordant dating. Discrepancy ${Math.abs(discrepancy)} days ≤7 days: both methods agree. No EDD revision needed.`;
    } else if (Math.abs(discrepancy) > 7 && Math.abs(discrepancy) <= 14) {
      assessment = `Discrepancy ${Math.abs(discrepancy)} days. Consider revising EDD to match ultrasound. LMP may be inaccurate.`;
    } else {
      assessment = `Large discrepancy ${Math.abs(discrepancy)} days (>14 days). Recommend ultrasound EDD. Verify LMP accuracy or investigate growth/dating issues.`;
    }
  } else {
    edd_lmp_str = "(No LMP provided)";
    assessment = "No LMP date provided. Ultrasound dating is your dating reference. Accuracy ±3–5 days.";
  }
  
  const edd_ultrasound_str = edd_ultrasound.toISOString().split('T')[0];
  const weeks_days_str = `${ga_weeks} weeks + ${ga_days} days`;
  
  return {
    gestational_weeks: weeks_days_str,
    edd_from_ultrasound: edd_ultrasound_str,
    edd_from_lmp: edd_lmp_str,
    dating_discrepancy_days: discrepancy,
    discrepancy_assessment: assessment
  };
}
