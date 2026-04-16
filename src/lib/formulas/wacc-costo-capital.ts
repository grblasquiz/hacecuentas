/** WACC (Weighted Average Cost of Capital) — costo promedio ponderado de capital */

export interface Inputs {
  capitalPropio: number;
  deudaTotal: number;
  costoEquity: number;
  costoDeuda: number;
  tasaImpositiva: number;
}

export interface Outputs {
  wacc: number;
  pesoEquity: number;
  pesoDeuda: number;
  costoDeudaPostTax: number;
  valorEmpresa: number;
  formula: string;
  explicacion: string;
}

export function waccCostoCapital(i: Inputs): Outputs {
  const equity = Number(i.capitalPropio);
  const deuda = Number(i.deudaTotal);
  const ke = Number(i.costoEquity);
  const kd = Number(i.costoDeuda);
  const tax = Number(i.tasaImpositiva);

  if (!equity || equity < 0) throw new Error('Ingresá el capital propio (equity)');
  if (deuda === undefined || deuda < 0) throw new Error('Ingresá la deuda total');
  if (!ke && ke !== 0) throw new Error('Ingresá el costo del equity (%)');
  if (!kd && kd !== 0) throw new Error('Ingresá el costo de la deuda (%)');

  const valorEmpresa = equity + deuda;
  if (valorEmpresa <= 0) throw new Error('El valor total de la empresa debe ser mayor a 0');

  const pesoEquity = equity / valorEmpresa;
  const pesoDeuda = deuda / valorEmpresa;
  const costoDeudaPostTax = kd * (1 - tax / 100);

  // WACC = (E/V) × Ke + (D/V) × Kd × (1 - t)
  const wacc = pesoEquity * ke + pesoDeuda * costoDeudaPostTax;

  const formula = `WACC = (${(pesoEquity * 100).toFixed(1)}% × ${ke}%) + (${(pesoDeuda * 100).toFixed(1)}% × ${kd}% × (1 - ${tax}%)) = ${wacc.toFixed(2)}%`;
  const explicacion = `Estructura de capital: equity $${equity.toLocaleString()} (${(pesoEquity * 100).toFixed(1)}%) + deuda $${deuda.toLocaleString()} (${(pesoDeuda * 100).toFixed(1)}%). Costo equity: ${ke}%. Costo deuda post-tax: ${costoDeudaPostTax.toFixed(2)}% (${kd}% × (1 - ${tax}%)). WACC: ${wacc.toFixed(2)}%. Este es el retorno mínimo que la empresa debe generar para satisfacer a inversores y acreedores.`;

  return {
    wacc: Number(wacc.toFixed(4)),
    pesoEquity: Number((pesoEquity * 100).toFixed(2)),
    pesoDeuda: Number((pesoDeuda * 100).toFixed(2)),
    costoDeudaPostTax: Number(costoDeudaPostTax.toFixed(4)),
    valorEmpresa,
    formula,
    explicacion,
  };
}
