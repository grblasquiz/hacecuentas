/** Comparativa remesas: WU vs Remitly vs Wise vs MoneyGram (fee + spread vs mid-market) */
export interface Inputs {
  montoUSD: number;
  tipoCambioMidMarket: number; // MXN por USD (o destino)
  feeWU: number;
  tcWU: number;
  feeRemitly: number;
  tcRemitly: number;
  feeWise: number;
  tcWise: number;
  feeMoneyGram: number;
  tcMoneyGram: number;
}

interface ProveedorRes {
  nombre: string;
  fee: number;
  tc: number;
  destinoRecibido: number;
  spreadUSD: number;
  costoTotalUSD: number;
  costoPct: number;
}

export interface Outputs {
  mejorProveedor: string;
  ahorroVsPeor: string;
  resumen: string;
  wuCostoTotal: string;
  remitlyCostoTotal: string;
  wiseCostoTotal: string;
  moneyGramCostoTotal: string;
  wuRecibido: string;
  remitlyRecibido: string;
  wiseRecibido: string;
  moneyGramRecibido: string;
}

function fmtUSD(n: number): string {
  return 'USD ' + n.toFixed(2);
}
function fmtDestino(n: number, simbolo: string): string {
  return simbolo + ' ' + Math.round(n).toLocaleString('es-MX');
}

export function comparativaRemesasProveedores(i: Inputs): Outputs {
  const monto = Number(i.montoUSD) || 0;
  const tcMid = Number(i.tipoCambioMidMarket) || 0;
  if (monto <= 0 || tcMid <= 0) throw new Error('Valores inválidos');

  const calc = (nombre: string, fee: number, tc: number): ProveedorRes => {
    const destino = monto * tc;
    const destinoAlMid = monto * tcMid;
    const spread = destinoAlMid - destino;
    const spreadUSD = spread / tcMid;
    const total = fee + spreadUSD;
    return {
      nombre,
      fee,
      tc,
      destinoRecibido: destino,
      spreadUSD,
      costoTotalUSD: total,
      costoPct: (total / monto) * 100,
    };
  };

  const wu = calc('Western Union', Number(i.feeWU) || 0, Number(i.tcWU) || 0);
  const remitly = calc('Remitly', Number(i.feeRemitly) || 0, Number(i.tcRemitly) || 0);
  const wise = calc('Wise', Number(i.feeWise) || 0, Number(i.tcWise) || 0);
  const mg = calc('MoneyGram', Number(i.feeMoneyGram) || 0, Number(i.tcMoneyGram) || 0);

  const lista = [wu, remitly, wise, mg].filter(p => p.tc > 0);
  lista.sort((a, b) => a.costoTotalUSD - b.costoTotalUSD);
  const mejor = lista[0];
  const peor = lista[lista.length - 1];
  const ahorro = peor.costoTotalUSD - mejor.costoTotalUSD;

  const simb = 'MXN $';

  return {
    mejorProveedor: `${mejor.nombre} (costo total ${fmtUSD(mejor.costoTotalUSD)}, ${mejor.costoPct.toFixed(2)}%)`,
    ahorroVsPeor: `${fmtUSD(ahorro)} vs ${peor.nombre}`,
    resumen: lista.map(p => `${p.nombre}: ${fmtUSD(p.costoTotalUSD)} (${p.costoPct.toFixed(2)}%)`).join(' | '),
    wuCostoTotal: fmtUSD(wu.costoTotalUSD),
    remitlyCostoTotal: fmtUSD(remitly.costoTotalUSD),
    wiseCostoTotal: fmtUSD(wise.costoTotalUSD),
    moneyGramCostoTotal: fmtUSD(mg.costoTotalUSD),
    wuRecibido: fmtDestino(wu.destinoRecibido, simb),
    remitlyRecibido: fmtDestino(remitly.destinoRecibido, simb),
    wiseRecibido: fmtDestino(wise.destinoRecibido, simb),
    moneyGramRecibido: fmtDestino(mg.destinoRecibido, simb),
  };
}
