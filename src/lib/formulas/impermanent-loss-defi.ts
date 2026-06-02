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
  _chart?: any;
  _insight?: any;
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

  // Gauge de severidad de la pérdida impermanente (sobre el valor absoluto del IL%).
  // Umbrales habituales en DeFi: <1% mínima, 1-5% moderada, 5-15% alta, >15% severa.
  const ilAbs = Math.abs(impermanentLossPorc);
  const ilMarker = Number(ilAbs.toFixed(2));
  const chart = {
    type: 'scale' as const,
    marker: ilMarker,
    markerLabel: `IL: ${ilMarker}%`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Mínima', max: 1, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderada', max: 5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alta', max: 15, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Severa', max: Math.max(25, Math.ceil(ilMarker) + 2), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Severidad de la pérdida impermanente: ${ilMarker}% sobre el valor que tendrías holdeando.`,
  };

  const netoPositivo = resultadoNeto >= 0;
  const cubreFees = apy > 0 && gananciaFees >= impermanentLossUsd;
  const insight = {
    title: cubreFees
      ? 'Las fees cubren la pérdida impermanente'
      : (netoPositivo ? 'Resultado neto positivo' : 'La pérdida impermanente te penaliza'),
    text: apy > 0
      ? `El precio se movió **${priceRatio.toFixed(2)}x** y generó **${ilAbs.toFixed(2)}%** de pérdida impermanente (**$${impermanentLossUsd.toFixed(2)}** menos que holdear). Con **${apy}% APY** sumás **$${gananciaFees.toFixed(2)}** en fees, dejando un resultado neto de **$${resultadoNeto.toFixed(2)}** (${netoPositivo ? 'ganancia' : 'pérdida'}).`
      : `El precio se movió **${priceRatio.toFixed(2)}x**, generando **${ilAbs.toFixed(2)}%** de pérdida impermanente: en el pool tenés **$${impermanentLossUsd.toFixed(2)}** menos que si hubieras holdeado. Cargá el APY del pool para ver si las fees la compensan.`,
    tone: (cubreFees || (apy > 0 && netoPositivo)) ? 'good' : 'warn',
    icon: '💧',
  };

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
    _chart: chart,
    _insight: insight,
  };
}
