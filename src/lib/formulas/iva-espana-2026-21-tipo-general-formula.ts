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
  _insight?: any;
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

  const pctSobreTotal = totalR > 0 ? Math.round((ivaR / totalR) * 1000) / 10 : 0;
  const insightText = mode === 'extract'
    ? `De los **€${totalR.toLocaleString('es-ES')}** que pagás, **€${ivaR.toLocaleString('es-ES')}** son IVA (el **${pctSobreTotal}%** del total) y **€${baseR.toLocaleString('es-ES')}** es la base imponible.`
    : `Sobre una base de **€${baseR.toLocaleString('es-ES')}** se suman **€${ivaR.toLocaleString('es-ES')}** de IVA al ${taxRateStr}%, dejando un total de **€${totalR.toLocaleString('es-ES')}**.`;

  const insight = {
    title: 'Qué incluye el precio',
    text: insightText,
    tone: 'neutral' as const,
    icon: '🧾',
  };

  return {
    iva_amount: ivaR,
    base_price: baseR,
    total_price: totalR,
    calculation_mode: calcMode,
    _chart: chart,
    _insight: insight
  };
}
