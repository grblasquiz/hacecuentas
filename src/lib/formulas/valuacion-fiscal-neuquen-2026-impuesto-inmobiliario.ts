export interface Inputs {
  surface_m2: number;
  property_type: string;
  zone: string;
  construction_year: number;
  early_payment: string;
}

export interface Outputs {
  fiscal_valuation: number;
  annual_tax: number;
  applicable_rate: number;
  early_payment_discount: number;
  final_tax: number;
  due_date: string;
  depreciation_note: number;
}

function getZoneValue(zone: string): number {
  const zoneValues: Record<string, number> = {
    centro: 200,
    semicentro: 160,
    residencial_media: 120,
    residencial_baja: 85,
    periferica: 55
  };
  return zoneValues[zone] || 120;
}

function getAliquot(zone: string, propertyType: string): number {
  let base = 0;
  if (zone === "centro") base = 1.2;
  else if (zone === "semicentro") base = 1.0;
  else if (zone === "residencial_media") base = 0.9;
  else if (zone === "residencial_baja") base = 0.8;
  else if (zone === "periferica") base = 0.7;

  if (propertyType === "comercial") return base + 0.2;
  if (propertyType === "mixto") return base + 0.15;
  if (propertyType === "terreno") return base - 0.1;
  return base;
}

function getPropertyTypeFactor(propertyType: string): number {
  const factors: Record<string, number> = {
    vivienda: 1.0,
    comercial: 1.3,
    terreno: 0.8,
    mixto: 1.15
  };
  return factors[propertyType] || 1.0;
}

function getDepreciationFactor(constructionYear: number): number {
  const age = 2026 - constructionYear;
  if (age <= 5) return 1.0;
  if (age <= 15) return 0.95;
  if (age <= 30) return 0.85;
  if (age <= 50) return 0.7;
  return 0.6;
}

export function compute(i: Inputs): Outputs {
  const surface = Number(i.surface_m2) || 0;
  if (surface <= 0) {
    return {
      fiscal_valuation: 0,
      annual_tax: 0,
      applicable_rate: 0,
      early_payment_discount: 0,
      final_tax: 0,
      due_date: "N/A",
      depreciation_note: 0
    };
  }

  const zoneValue = getZoneValue(i.zone);
  const propertyTypeFactor = getPropertyTypeFactor(i.property_type);
  const depreciationFactor = getDepreciationFactor(Number(i.construction_year));
  const aliquot = getAliquot(i.zone, i.property_type) / 100;

  const fiscalValuation = zoneValue * surface * depreciationFactor * propertyTypeFactor;
  const annualTax = fiscalValuation * aliquot;

  let earlyPaymentDiscount = 0;
  if (i.early_payment === "yes") {
    earlyPaymentDiscount = annualTax * 0.15;
  }

  const finalTax = annualTax - earlyPaymentDiscount;
  const depreciationPercent = (1 - depreciationFactor) * 100;

  return {
    fiscal_valuation: Math.round(fiscalValuation * 100) / 100,
    annual_tax: Math.round(annualTax * 100) / 100,
    applicable_rate: Math.round(aliquot * 10000) / 100,
    early_payment_discount: Math.round(earlyPaymentDiscount * 100) / 100,
    final_tax: Math.round(finalTax * 100) / 100,
    due_date: "31 de marzo de 2026 (1ª cuota)",
    depreciation_note: Math.round(depreciationPercent * 100) / 100
  };
}
