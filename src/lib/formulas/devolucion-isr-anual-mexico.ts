/**
 * Calculadora de Devolución ISR Anual México
 * Comparación entre ISR anual calculado y retenciones del año
 * Deducciones personales con tope: menor entre 15% de ingresos o 5 UMA anuales
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  ingresosAnuales: number;
  retencionesTotales: number;
  deduccionesPersonales?: number;
  subsidioRecibido?: number;
}

export interface Outputs {
  saldoFavor: number;
  montoDevolucion: number;
  debePagar: number;
  isrAnualCalculado: number;
  deduccionesAplicadas: number;
  topeDeducciones: number;
  mensaje: string;
}

// Tabla ISR ANUAL 2026 (proyectada: 2025 +5%)
// Valores proyectados 2026, validar contra fuente oficial
const TABLA_ISR_ANUAL_2026 = [
  { limInf: 0.01,       limSup: 9900.74,     cuotaFija: 0.00,       tasa: 1.92 },
  { limInf: 9900.75,    limSup: 84064.62,    cuotaFija: 190.08,     tasa: 6.40 },
  { limInf: 84064.63,   limSup: 147766.08,   cuotaFija: 4936.68,    tasa: 10.88 },
  { limInf: 147766.09,  limSup: 171790.92,   cuotaFija: 11867.52,   tasa: 16.00 },
  { limInf: 171790.93,  limSup: 205682.52,   cuotaFija: 15711.36,   tasa: 17.92 },
  { limInf: 205682.53,  limSup: 414878.28,   cuotaFija: 21785.76,   tasa: 21.36 },
  { limInf: 414878.29,  limSup: 653610.84,   cuotaFija: 66479.64,   tasa: 23.52 },
  { limInf: 653610.85,  limSup: 1247616.48,  cuotaFija: 122618.76,  tasa: 30.00 },
  { limInf: 1247616.49, limSup: 1663488.72,  cuotaFija: 300820.44,  tasa: 32.00 },
  { limInf: 1663488.73, limSup: 4990466.16,  cuotaFija: 433899.48,  tasa: 34.00 },
  { limInf: 4990466.17, limSup: Infinity,    cuotaFija: 1565053.20, tasa: 35.00 },
];

export function devolucionIsrAnualMexico(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosAnuales);
  const retenciones = Number(i.retencionesTotales);
  const deduccionesInput = Number(i.deduccionesPersonales ?? 0);
  const subsidio = Number(i.subsidioRecibido ?? 0);

  if (!ingresos || ingresos <= 0) throw new Error('Ingresá los ingresos anuales');
  if (retenciones === undefined || retenciones === null || isNaN(retenciones) || retenciones < 0) {
    throw new Error('Ingresá las retenciones totales del año');
  }

  // Tope deducciones: menor entre 15% de ingresos o 5 UMA anuales (5 * 43800 = 219000 en 2026)
  const topeUMA = 5 * 43800;
  const tope15 = ingresos * 0.15;
  const topeDeducciones = Math.min(topeUMA, tope15);
  const deduccionesAplicadas = Math.min(deduccionesInput, topeDeducciones);

  const baseGravable = Math.max(0, ingresos - deduccionesAplicadas);
  const tramo = TABLA_ISR_ANUAL_2026.find(t => baseGravable >= t.limInf && baseGravable <= t.limSup)!;
  const excedente = baseGravable - tramo.limInf;
  const isrAnualCalculado = tramo.cuotaFija + (excedente * tramo.tasa / 100);

  // Saldo = retenciones + subsidio - ISR anual
  // Positivo = devolución; Negativo = debe pagar
  const saldoFavor = retenciones + subsidio - isrAnualCalculado;
  const montoDevolucion = saldoFavor > 0 ? saldoFavor : 0;
  const debePagar = saldoFavor < 0 ? Math.abs(saldoFavor) : 0;

  let mensaje = '';
  if (montoDevolucion > 0) {
    mensaje = `Tenés saldo a favor de $${montoDevolucion.toFixed(2)}. Podés solicitar devolución al SAT.`;
  } else if (debePagar > 0) {
    mensaje = `Tenés ISR por pagar: $${debePagar.toFixed(2)} en tu declaración anual.`;
  } else {
    mensaje = `Tus retenciones coinciden con el ISR anual calculado. No hay saldo a favor ni a cargo.`;
  }

  return {
    saldoFavor: Number(saldoFavor.toFixed(2)),
    montoDevolucion: Number(montoDevolucion.toFixed(2)),
    debePagar: Number(debePagar.toFixed(2)),
    isrAnualCalculado: Number(isrAnualCalculado.toFixed(2)),
    deduccionesAplicadas: Number(deduccionesAplicadas.toFixed(2)),
    topeDeducciones: Number(topeDeducciones.toFixed(2)),
    mensaje,
  };
}
