/** Impermanent Loss (pérdida impermanente) en pools de liquidez DeFi
 *  Fórmula: IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
 */

export interface Inputs {
  montoInvertidoUsd: number;
  precioInicialToken: number;
  precioFinalToken: number;
  apyPool: number;
  periodoMeses: number;
}

export interface Outputs {
  impermanentLossPorc: number;
  impermanentLossUsd: number;
  valorPoolActual: number;
  valorHoldActual: number;
  gananciaFees: number;
  resultadoNeto: number;
  priceRatio: number;
  formula: string;
  explicacion: string;
}

export function impermanentLossDefi(i: Inputs): Outputs {
  const monto = Number(i.montoInvertidoUsd);
  const precioInicial = Number(i.precioInicialToken);
  const precioFinal = Number(i.precioFinalToken);
  const apy = Number(i.apyPool) || 0;
  const meses = Number(i.periodoMeses) || 12;

  if (!monto || monto <= 0) throw new Error('Ingresá el monto invertido en USD');
  if (!precioInicial || precioInicial <= 0) throw new Error('Ingresá el precio inicial del token');
  if (!precioFinal || precioFinal <= 0) throw new Error('Ingresá el precio final del token');

  // Price ratio = new price / old price
  const priceRatio = precioFinal / precioInicial;

  // IL formula: IL = 2 * sqrt(r) / (1 + r) - 1
  const sqrtRatio = Math.sqrt(priceRatio);
  const impermanentLossPorc = (2 * sqrtRatio / (1 + priceRatio) - 1) * 100;

  // Valor si HOLD: mitad en token, mitad en stable
  // Token side: (monto/2 / precioInicial) * precioFinal
  // Stable side: monto/2
  const valorHoldActual = (monto / 2) * priceRatio + monto / 2;

  // Valor en pool (con IL)
  const valorPoolSinFees = valorHoldActual * (1 + impermanentLossPorc / 100);

  // Ganancia por fees del pool (APY proporcional al período)
  const gananciaFees = monto * (apy / 100) * (meses / 12);
  const valorPoolActual = valorPoolSinFees + gananciaFees;

  const impermanentLossUsd = valorHoldActual - valorPoolSinFees;
  const resultadoNeto = valorPoolActual - monto;

  const formula = `IL = 2×√(${priceRatio.toFixed(4)}) / (1 + ${priceRatio.toFixed(4)}) - 1 = ${impermanentLossPorc.toFixed(2)}%`;
  const explicacion = `Con un price ratio de ${priceRatio.toFixed(4)}x (de $${precioInicial} a $${precioFinal}), la pérdida impermanente es ${Math.abs(impermanentLossPorc).toFixed(2)}%. Si hubieras holdeado, tendrías $${valorHoldActual.toFixed(2)}. En el pool (sin fees): $${valorPoolSinFees.toFixed(2)}. Diferencia (IL): $${impermanentLossUsd.toFixed(2)}.${apy > 0 ? ` Con ${apy}% APY en ${meses} meses ganás $${gananciaFees.toFixed(2)} en fees. Resultado neto: $${resultadoNeto.toFixed(2)} (${resultadoNeto >= 0 ? 'ganancia' : 'pérdida'}).` : ''}`;

  return {
    impermanentLossPorc: Number(impermanentLossPorc.toFixed(4)),
    impermanentLossUsd: Number(impermanentLossUsd.toFixed(2)),
    valorPoolActual: Number(valorPoolActual.toFixed(2)),
    valorHoldActual: Number(valorHoldActual.toFixed(2)),
    gananciaFees: Number(gananciaFees.toFixed(2)),
    resultadoNeto: Number(resultadoNeto.toFixed(2)),
    priceRatio: Number(priceRatio.toFixed(6)),
    formula,
    explicacion,
  };
}
