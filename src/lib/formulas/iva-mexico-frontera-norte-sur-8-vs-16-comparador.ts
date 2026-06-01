export interface Inputs {
  price_before_tax: number;
  location: string;
}

export interface Outputs {
  iva_amount: number;
  total_with_tax: number;
  savings_vs_general: number;
  tax_rate_applied: number;
  info_message: string;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const priceBeforeTax = Number(i.price_before_tax) || 0;
  const location = String(i.location || 'general');

  if (priceBeforeTax < 0) {
    return {
      iva_amount: 0,
      total_with_tax: priceBeforeTax,
      savings_vs_general: 0,
      tax_rate_applied: 0,
      info_message: 'Ingresa un precio válido (>= 0)'
    };
  }

  // Determine tax rate based on location
  let taxRate = 0.16; // Default: general 16%
  let locationName = 'Resto de México';

  if (location === 'border_north') {
    taxRate = 0.08;
    locationName = 'Frontera norte';
  } else if (location === 'border_south') {
    taxRate = 0.08;
    locationName = 'Frontera sur';
  }

  // Calculate IVA
  const ivaAmount = priceBeforeTax * taxRate;
  const totalWithTax = priceBeforeTax + ivaAmount;

  // Calculate savings vs general 16% rate
  const ivaAt16Percent = priceBeforeTax * 0.16;
  const savingsVsGeneral = ivaAt16Percent - ivaAmount;

  // Info message
  let infoMsg = '';
  if (location === 'border_north') {
    infoMsg = 'Zona fronteriza norte: IVA 8% aplicado. Requiere domicilio fiscal en municipios fronterizos del SAT. Estados: Baja California, Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas.';
  } else if (location === 'border_south') {
    infoMsg = 'Zona fronteriza sur: IVA 8% aplicado. Requiere domicilio fiscal en municipios fronterizos del SAT. Estados: Tabasco, Campeche, Quintana Roo (y parcialmente Chiapas).';
  } else {
    infoMsg = 'Tasa general 16% para resto de México. No aplica estímulo fiscal fronterizo.';
  }

  const ivaR = parseFloat(ivaAmount.toFixed(2));
  const baseR = parseFloat(priceBeforeTax.toFixed(2));
  const totalR = parseFloat(totalWithTax.toFixed(2));
  const ratePct = Math.round(taxRate * 100);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Precio sin IVA', value: baseR },
      { label: `IVA ${ratePct}%`, value: ivaR },
    ],
    prefix: '$',
    centerValue: '$' + totalR.toLocaleString('es-MX'),
    centerLabel: 'Total con IVA',
    ariaLabel: 'Composición del precio total: precio sin IVA más IVA aplicado',
  };

  return {
    iva_amount: ivaR,
    total_with_tax: totalR,
    savings_vs_general: parseFloat(savingsVsGeneral.toFixed(2)),
    tax_rate_applied: taxRate,
    info_message: infoMsg,
    _chart: chart
  };
}
