/**
 * Calculadora de rendimiento de CETES México
 * Fórmula simple: rendimiento = monto × (tasa/100) × (días/360)
 * Con reinversión: interés compuesto período a período.
 * ISR: 0.15% anual sobre el monto invertido (tasa especial personas físicas).
 */

export interface Inputs {
  monto: number;
  plazoDias: number;
  tasaAnual: number;
  reinversion?: number;
}

export interface Outputs {
  rendimientoBruto: number;
  isrRetenido: number;
  rendimientoNeto: number;
  saldoFinal: number;
  tasaRealAnual: number;
  mensaje: string;
}

export function cetesRendimientoMx(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const dias = Number(i.plazoDias);
  const tasa = Number(i.tasaAnual);
  const reinversiones = Math.max(1, Number(i.reinversion ?? 1));

  if (!monto || monto <= 0) throw new Error('Ingresá el monto a invertir');
  if (!dias || dias <= 0) throw new Error('Ingresá el plazo en días');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual');

  // Rendimiento por período
  const rendPeriodo = (tasa / 100) * (dias / 360);
  // Con reinversión: compuesto
  const factor = Math.pow(1 + rendPeriodo, reinversiones);
  const saldoBruto = monto * factor;
  const rendimientoBruto = saldoBruto - monto;

  const diasTotales = dias * reinversiones;
  const isrRetenido = monto * 0.0015 * (diasTotales / 360);
  const rendimientoNeto = rendimientoBruto - isrRetenido;
  const saldoFinal = monto + rendimientoNeto;
  const tasaRealAnual = (rendimientoNeto / monto) * (360 / diasTotales) * 100;

  return {
    rendimientoBruto: Number(rendimientoBruto.toFixed(2)),
    isrRetenido: Number(isrRetenido.toFixed(2)),
    rendimientoNeto: Number(rendimientoNeto.toFixed(2)),
    saldoFinal: Number(saldoFinal.toFixed(2)),
    tasaRealAnual: Number(tasaRealAnual.toFixed(2)),
    mensaje: `Invirtiendo $${monto} a ${dias} días (${reinversiones} reinv.) al ${tasa}% anual ganás $${rendimientoNeto.toFixed(2)} netos. Saldo final $${saldoFinal.toFixed(2)}.`,
  };
}
