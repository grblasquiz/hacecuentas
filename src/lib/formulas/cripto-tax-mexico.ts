/** Cripto tax México ISR */
export interface Inputs { gananciaPesos: number; otrosIngresosAnuales: number; }
export interface Outputs { isrAplicable: number; tramoMarginal: number; netoPesos: number; explicacion: string; }
export function criptoTaxMexicoIsr(i: Inputs): Outputs {
  const gan = Number(i.gananciaPesos);
  const otros = Number(i.otrosIngresosAnuales) || 0;
  if (gan < 0) throw new Error('Ganancia inválida');
  const total = gan + otros;
  let marginal = 0;
  let impuestoTotal = 0;
  const tramos = [
    { limite: 8952.49, cuota: 0, porciento: 1.92 },
    { limite: 75984.55, cuota: 171.88, porciento: 6.40 },
    { limite: 133536.07, cuota: 4461.94, porciento: 10.88 },
    { limite: 155229.80, cuota: 10723.55, porciento: 16 },
    { limite: 185852.57, cuota: 14194.54, porciento: 17.92 },
    { limite: 374837.88, cuota: 19682.13, porciento: 21.36 },
    { limite: 590795.99, cuota: 60049.40, porciento: 23.52 },
    { limite: 1127926.84, cuota: 110842.74, porciento: 30 },
    { limite: 1503902.46, cuota: 271981.99, porciento: 32 },
    { limite: 4511707.37, cuota: 392294.17, porciento: 34 },
    { limite: Infinity, cuota: 1414947.85, porciento: 35 },
  ];
  for (const t of tramos) {
    if (total <= t.limite) {
      const excedente = total - (tramos[tramos.indexOf(t) - 1]?.limite || 0);
      impuestoTotal = t.cuota + excedente * (t.porciento / 100);
      marginal = t.porciento;
      break;
    }
  }
  const isrTotal = impuestoTotal;
  const isrOtrosSolo = (() => {
    let r = 0;
    for (const t of tramos) {
      if (otros <= t.limite) {
        const ex = otros - (tramos[tramos.indexOf(t) - 1]?.limite || 0);
        r = t.cuota + ex * (t.porciento / 100);
        break;
      }
    }
    return r;
  })();
  const isrCripto = isrTotal - isrOtrosSolo;
  const neto = gan - isrCripto;
  return {
    isrAplicable: Number(isrCripto.toFixed(2)),
    tramoMarginal: Number(marginal.toFixed(2)),
    netoPesos: Number(neto.toFixed(2)),
    explicacion: `Ganancia MXN ${gan.toLocaleString()} + otros ingresos ${otros.toLocaleString()} = total ${total.toLocaleString()}. ISR incremental sobre cripto: ${isrCripto.toLocaleString()} (tramo marginal ${marginal}%). Neto ${neto.toLocaleString()} MXN.`,
  };
}
