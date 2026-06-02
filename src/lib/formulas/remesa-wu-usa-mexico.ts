/** Costo real remesa Western Union USA->México: fee + spread tipo cambio vs mid-market */
export interface Inputs {
  montoUSD: number;
  feeWUDolares: number; // fee directo de WU en USD
  tipoCambioOfrecido: number; // MXN por 1 USD que ofrece WU
  tipoCambioMidMarket: number; // MXN por 1 USD en interbank rate (ej. XE, Google)
}

export interface Outputs {
  montoEnviadoUSD: string;
  feeDirectoUSD: string;
  mxnRecibidoConWU: string;
  mxnRecibidoAlMidMarket: string;
  spreadOcultoMXN: string;
  spreadOcultoUSD: string;
  costoTotalUSD: string;
  costoTotalPct: string;
  tcDiferenciaPct: number;
  costoTotalPctNum: number;
  _insight?: any;
  _chart?: any;
}

function fmtUSD(n: number): string {
  return 'USD ' + n.toFixed(2);
}
function fmtMXN(n: number): string {
  return 'MXN $' + Math.round(n).toLocaleString('es-MX');
}

export function remesaWuUsaMexico(i: Inputs): Outputs {
  const monto = Number(i.montoUSD) || 0;
  const fee = Number(i.feeWUDolares) || 0;
  const tcWU = Number(i.tipoCambioOfrecido) || 0;
  const tcMid = Number(i.tipoCambioMidMarket) || 0;

  if (monto <= 0) throw new Error('Ingresá un monto mayor a 0.');
  if (tcWU <= 0 || tcMid <= 0) throw new Error('Tipo de cambio inválido.');

  const mxnConWU = monto * tcWU;
  const mxnAlMid = monto * tcMid;
  const spreadMXN = mxnAlMid - mxnConWU; // lo que pierde el receptor
  const spreadUSD = spreadMXN / tcMid;
  const costoTotalUSD = fee + spreadUSD;
  const costoPct = (costoTotalUSD / monto) * 100;
  const tcDiffPct = ((tcMid - tcWU) / tcMid) * 100;

  const tone = costoPct >= 5 ? 'warn' : costoPct >= 2 ? 'neutral' : 'good';
  const insight = {
    title: 'Costo real de la remesa',
    text: `Enviar **USD ${monto.toFixed(2)}** te cuesta en total **USD ${costoTotalUSD.toFixed(2)}** (**${costoPct.toFixed(1)}%**): USD ${fee.toFixed(2)} de comisión visible más USD ${spreadUSD.toFixed(2)} de spread oculto en el tipo de cambio (${tcDiffPct.toFixed(1)}% peor que el interbancario).${tone === 'warn' ? ' Es un costo alto: compará con otros operadores.' : ''}`,
    tone,
    icon: '💸',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Comisión visible', value: Number(fee.toFixed(2)) },
      { label: 'Spread oculto', value: Number(spreadUSD.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: 'USD ' + costoTotalUSD.toFixed(2),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo total de la remesa entre comisión visible y spread oculto del tipo de cambio.',
  };

  return {
    montoEnviadoUSD: fmtUSD(monto),
    feeDirectoUSD: fmtUSD(fee),
    mxnRecibidoConWU: fmtMXN(mxnConWU),
    mxnRecibidoAlMidMarket: fmtMXN(mxnAlMid),
    spreadOcultoMXN: fmtMXN(spreadMXN),
    spreadOcultoUSD: fmtUSD(spreadUSD),
    costoTotalUSD: fmtUSD(costoTotalUSD),
    costoTotalPct: costoPct.toFixed(2) + '%',
    tcDiferenciaPct: Number(tcDiffPct.toFixed(2)),
    costoTotalPctNum: Number(costoPct.toFixed(2)),
    _insight: insight,
    _chart: chart,
  };
}
