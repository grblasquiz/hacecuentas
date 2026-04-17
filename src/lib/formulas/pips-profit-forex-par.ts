/** Calculadora de Pips Forex (valor por par) */
export interface Inputs { par: number; tamanoLote: number; tipoPar: 'usd_quote'|'usd_base'|'cross'; pipDecimal: number; }
export interface Outputs { valorPipUSD: number; valor10Pips: number; valor100Pips: number; pipsPorDolar: number; }
export function pipsProfitForexPar(i: Inputs): Outputs {
  const par = Number(i.par); const lote = Number(i.tamanoLote);
  const pip = Number(i.pipDecimal);
  if (!par || par <= 0) throw new Error('Ingresá cotización');
  if (!lote || lote <= 0) throw new Error('Ingresá lote');
  if (!pip || pip <= 0) throw new Error('Ingresá decimal pip');
  let valor = 0;
  if (i.tipoPar === 'usd_quote') {
    valor = pip * lote;
  } else if (i.tipoPar === 'usd_base') {
    valor = (pip / par) * lote;
  } else {
    valor = pip * lote;  // approx, usuario ajusta
  }
  return {
    valorPipUSD: Number(valor.toFixed(4)),
    valor10Pips: Number((valor * 10).toFixed(2)),
    valor100Pips: Number((valor * 100).toFixed(2)),
    pipsPorDolar: Number((1 / valor).toFixed(3)),
  };
}