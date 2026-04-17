/** Cripto tax España IRPF */
export interface Inputs { gananciaEuros: number; }
export interface Outputs { impuestoEuros: number; aliquotaEfectiva: number; desglose: string; netoEuros: number; explicacion: string; }
export function criptoTaxEspanaIrpf(i: Inputs): Outputs {
  const gan = Number(i.gananciaEuros);
  if (gan < 0) throw new Error('Ganancia inválida');
  const tramos = [
    { limite: 6000, porciento: 19 },
    { limite: 50000, porciento: 21 },
    { limite: 200000, porciento: 23 },
    { limite: 300000, porciento: 27 },
    { limite: Infinity, porciento: 28 },
  ];
  let impuesto = 0;
  let acumulado = 0;
  let desglose = '';
  for (const t of tramos) {
    const tramo = Math.min(gan, t.limite) - acumulado;
    if (tramo <= 0) break;
    const imp = tramo * (t.porciento / 100);
    impuesto += imp;
    desglose += `${tramo.toFixed(0)}€ @ ${t.porciento}% = ${imp.toFixed(2)}€ | `;
    acumulado = t.limite;
    if (gan <= t.limite) break;
  }
  const alicuota = gan > 0 ? (impuesto / gan) * 100 : 0;
  const neto = gan - impuesto;
  return {
    impuestoEuros: Number(impuesto.toFixed(2)),
    aliquotaEfectiva: Number(alicuota.toFixed(2)),
    desglose: desglose,
    netoEuros: Number(neto.toFixed(2)),
    explicacion: `Ganancia ${gan.toLocaleString()}€: impuesto ${impuesto.toFixed(2)}€ (alícuota efectiva ${alicuota.toFixed(2)}%). Neto ${neto.toFixed(2)}€.`,
  };
}
