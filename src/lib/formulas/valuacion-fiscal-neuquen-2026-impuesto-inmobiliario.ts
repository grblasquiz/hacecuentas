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
  _insight?: any;
  _chart?: any;
}

function getZoneValue(zone: string): number {
  // Valor fiscal de referencia por m² en ARS (Neuquén 2026).
  // La valuación fiscal NO es valor de mercado: es el valor catastral
  // sobre el que se aplica la alícuota del impuesto inmobiliario provincial.
  const zoneValues: Record<string, number> = {
    centro: 250000,
    semicentro: 200000,
    residencial_media: 150000,
    residencial_baja: 110000,
    periferica: 70000
  };
  return zoneValues[zone] || 150000;
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

  const fmtAr = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const ratePct = Math.round(aliquot * 10000) / 100;
  const age = 2026 - Number(i.construction_year);

  const insight = {
    title: 'Tu impuesto inmobiliario',
    text: earlyPaymentDiscount > 0
      ? `Pagás **$${fmtAr.format(Math.round(finalTax))}** anuales tras el **15% de descuento** por pago contado (ahorrás $${fmtAr.format(Math.round(earlyPaymentDiscount))}). La alícuota es del **${ratePct}%** sobre una valuación fiscal de $${fmtAr.format(Math.round(fiscalValuation))}.`
      : `El impuesto anual es de **$${fmtAr.format(Math.round(annualTax))}** (alícuota **${ratePct}%** sobre $${fmtAr.format(Math.round(fiscalValuation))} de valuación). Pagando al contado ahorrarías un **15%** ($${fmtAr.format(Math.round(annualTax * 0.15))}).`,
    tone: earlyPaymentDiscount > 0 ? 'good' : 'neutral',
    icon: '🏠'
  };

  return {
    fiscal_valuation: Math.round(fiscalValuation * 100) / 100,
    annual_tax: Math.round(annualTax * 100) / 100,
    applicable_rate: ratePct,
    early_payment_discount: Math.round(earlyPaymentDiscount * 100) / 100,
    final_tax: Math.round(finalTax * 100) / 100,
    due_date: "31 de marzo de 2026 (1ª cuota)",
    depreciation_note: Math.round(depreciationPercent * 100) / 100,
    _insight: insight,
    _chart: earlyPaymentDiscount > 0 ? {
      type: 'doughnut',
      slices: [
        { label: 'Impuesto a pagar', value: Math.round(finalTax * 100) / 100 },
        { label: 'Descuento contado (15%)', value: Math.round(earlyPaymentDiscount * 100) / 100 }
      ],
      prefix: '$',
      centerValue: '$' + fmtAr.format(Math.round(annualTax)),
      centerLabel: 'Impuesto anual',
      ariaLabel: `Del impuesto anual de $${fmtAr.format(Math.round(annualTax))}, pagás $${fmtAr.format(Math.round(finalTax))} y ahorrás $${fmtAr.format(Math.round(earlyPaymentDiscount))} por pago contado`
    } : undefined
  };
}
