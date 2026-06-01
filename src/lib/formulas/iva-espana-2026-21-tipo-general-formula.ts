export interface Inputs {
  amount: number;
  mode: string;
  tax_rate: string;
}

export interface Outputs {
  iva_amount: number;
  base_price: number;
  total_price: number;
  calculation_mode: string;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const amount = Number(i.amount) || 0;
  const mode = String(i.mode || 'sum').toLowerCase();
  const taxRateStr = String(i.tax_rate || '21');
  const taxRate = Number(taxRateStr) / 100;

  if (amount <= 0) {
    return {
      iva_amount: 0,
      base_price: 0,
      total_price: 0,
      calculation_mode: 'Entrada inválida'
    };
  }

  let basePrice: number;
  let totalPrice: number;
  let ivaAmount: number;
  let calcMode: string;

  if (mode === 'sum') {
    // Suma IVA: tengo precio sin IVA (base), calculo total
    basePrice = amount;
    ivaAmount = basePrice * taxRate;
    totalPrice = basePrice + ivaAmount;
    calcMode = `Sumar IVA ${taxRateStr}%`;
  } else if (mode === 'extract') {
    // Extrae IVA: tengo precio con IVA (total), calculo base
    totalPrice = amount;
    basePrice = totalPrice / (1 + taxRate);
    ivaAmount = totalPrice - basePrice;
    calcMode = `Extraer IVA ${taxRateStr}%`;
  } else {
    return {
      iva_amount: 0,
      base_price: 0,
      total_price: 0,
      calculation_mode: 'Modo de cálculo no reconocido'
    };
  }

  // Redondeo a 2 decimales para moneda EUR
  const ivaR = Math.round(ivaAmount * 100) / 100;
  const baseR = Math.round(basePrice * 100) / 100;
  const totalR = Math.round(totalPrice * 100) / 100;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Base imponible', value: baseR },
      { label: `IVA ${taxRateStr}%`, value: ivaR },
    ],
    prefix: '€',
    centerValue: '€' + totalR.toLocaleString('es-ES'),
    centerLabel: 'Total con IVA',
    ariaLabel: 'Composición del precio total: base imponible más IVA',
  };

  return {
    iva_amount: ivaR,
    base_price: baseR,
    total_price: totalR,
    calculation_mode: calcMode,
    _chart: chart
  };
}
