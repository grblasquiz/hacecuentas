/** Ganancia/pérdida de trade cripto con fees de entrada y salida */

export interface Inputs {
  precioEntrada: number;
  precioSalida: number;
  cantidad: number;
  feeMaker: number;
  feeTaker: number;
  posicion: string;
}

export interface Outputs {
  pnlBruto: number;
  feesTotal: number;
  pnlNeto: number;
  pnlPorcentaje: number;
  breakEvenPrice: number;
  formula: string;
  explicacion: string;
}

export function profitLossCriptoTrade(i: Inputs): Outputs {
  const entrada = Number(i.precioEntrada);
  const salida = Number(i.precioSalida);
  const cantidad = Number(i.cantidad);
  const feeMaker = Number(i.feeMaker) || 0.1;
  const feeTaker = Number(i.feeTaker) || 0.1;
  const posicion = String(i.posicion || 'long').toLowerCase();

  if (!entrada || entrada <= 0) throw new Error('Ingresá el precio de entrada');
  if (!salida || salida <= 0) throw new Error('Ingresá el precio de salida');
  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de tokens');

  const costoEntrada = entrada * cantidad;
  const costoSalida = salida * cantidad;

  // Fees
  const feeEntradaMonto = costoEntrada * (feeMaker / 100);
  const feeSalidaMonto = costoSalida * (feeTaker / 100);
  const feesTotal = feeEntradaMonto + feeSalidaMonto;

  let pnlBruto: number;
  if (posicion === 'long') {
    pnlBruto = costoSalida - costoEntrada;
  } else {
    pnlBruto = costoEntrada - costoSalida;
  }

  const pnlNeto = pnlBruto - feesTotal;
  const pnlPorcentaje = (pnlNeto / costoEntrada) * 100;

  // Break-even: precio al que PnL neto = 0
  let breakEvenPrice: number;
  if (posicion === 'long') {
    breakEvenPrice = entrada * (1 + feeMaker / 100) / (1 - feeTaker / 100);
  } else {
    breakEvenPrice = entrada * (1 - feeMaker / 100) / (1 + feeTaker / 100);
  }

  const resultado = pnlNeto >= 0 ? 'ganancia' : 'pérdida';
  const formula = `PnL = (${posicion === 'long' ? `$${salida} - $${entrada}` : `$${entrada} - $${salida}`}) × ${cantidad} - fees = $${pnlNeto.toFixed(2)}`;
  const explicacion = `Trade ${posicion.toUpperCase()}: entrada a $${entrada.toLocaleString()}, salida a $${salida.toLocaleString()}, ${cantidad} tokens. PnL bruto: $${pnlBruto.toFixed(2)}. Fees totales: $${feesTotal.toFixed(2)} (maker ${feeMaker}% + taker ${feeTaker}%). PnL neto: $${pnlNeto.toFixed(2)} (${pnlPorcentaje.toFixed(2)}% ${resultado}). Break-even: $${breakEvenPrice.toFixed(2)}.`;

  return {
    pnlBruto: Number(pnlBruto.toFixed(2)),
    feesTotal: Number(feesTotal.toFixed(2)),
    pnlNeto: Number(pnlNeto.toFixed(2)),
    pnlPorcentaje: Number(pnlPorcentaje.toFixed(2)),
    breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
    formula,
    explicacion,
  };
}
