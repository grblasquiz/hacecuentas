/**
 * Calculadora de rendimiento de CETES México
 * Fórmula: rendimiento = monto × (tasa/100) × (días/360)
 * ISR 0.5% anual sobre el monto invertido (retenido por intermediario)
 */

export interface Inputs {
  monto: number;
  plazoDias: number;
  tasaAnual: number; // %
}

export interface Outputs {
  rendimientoBruto: number;
  isr: number;
  rendimientoNeto: number;
  montoFinal: number;
  tasaRealAnual: number;
  mensaje: string;
}

export function cetesRendimientoMx(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const dias = Number(i.plazoDias);
  const tasa = Number(i.tasaAnual);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto a invertir');
  if (!dias || dias <= 0) throw new Error('Ingresá el plazo en días');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual');

  const rendimientoBruto = monto * (tasa / 100) * (dias / 360);
  // ISR 0.5% anual sobre el monto invertido, proporcional al plazo
  const isr = monto * 0.005 * (dias / 360);
  const rendimientoNeto = rendimientoBruto - isr;
  const montoFinal = monto + rendimientoNeto;
  const tasaRealAnual = (rendimientoNeto / monto) * (360 / dias) * 100;

  return {
    rendimientoBruto: Number(rendimientoBruto.toFixed(2)),
    isr: Number(isr.toFixed(2)),
    rendimientoNeto: Number(rendimientoNeto.toFixed(2)),
    montoFinal: Number(montoFinal.toFixed(2)),
    tasaRealAnual: Number(tasaRealAnual.toFixed(2)),
    mensaje: `Invirtiendo $${monto} a ${dias} días al ${tasa}% anual ganás $${rendimientoNeto.toFixed(2)} netos (tras ISR $${isr.toFixed(2)}). Recibís $${montoFinal.toFixed(2)}.`,
  };
}
