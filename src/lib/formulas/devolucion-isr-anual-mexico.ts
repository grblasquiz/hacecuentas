/**
 * Calculadora de Devolución ISR Anual México
 * Comparación entre ISR anual calculado y retenciones del año
 * Deducciones personales con tope: menor entre 15% de ingresos o 5 UMA anuales
 * Constantes (tarifa ISR anual 2026, UMA anual, tope deducciones): fuente única
 * src/lib/data/mexico-2026.ts (SAT Anexo 8 RMF 2026, INEGI).
 */
import { MEXICO_2026, isrAnual2026 } from '../data/mexico-2026';

export interface Inputs {
  ingresosAnuales: number;
  isrRetenido: number;
  gastosMedicos?: number;
  colegiaturas?: number;
  interesesHipoteca?: number;
  aportacionesAfore?: number;
  subsidioRecibido?: number;
}

export interface Outputs {
  saldoFavor: number;
  montoDevolucion: number;
  debePagar: number;
  isrAnualCalculado: number;
  deduccionesAplicadas: number;
  baseGravable: number;
  topeDeducciones: number;
  mensaje: string;
  _insight?: any;
}

export function devolucionIsrAnualMexico(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosAnuales);
  const retenciones = Number(i.isrRetenido);
  const subsidio = Number(i.subsidioRecibido ?? 0);

  const gastosMedicos = Number(i.gastosMedicos ?? 0);
  const colegiaturas = Number(i.colegiaturas ?? 0);
  const interesesHipoteca = Number(i.interesesHipoteca ?? 0);
  const aportacionesAfore = Number(i.aportacionesAfore ?? 0);
  const deduccionesInput = gastosMedicos + colegiaturas + interesesHipoteca + aportacionesAfore;

  if (!ingresos || ingresos <= 0) throw new Error('Ingresá los ingresos anuales');
  if (retenciones === undefined || retenciones === null || isNaN(retenciones) || retenciones < 0) {
    throw new Error('Ingresá el ISR retenido en el año');
  }

  const topeUMA = MEXICO_2026.deduccionesPersonales.topeUmasAnuales * MEXICO_2026.uma.anual; // 5 UMA anuales (Art. 151 LISR)
  const tope15 = ingresos * MEXICO_2026.deduccionesPersonales.topePorcentajeIngresos;
  const topeDeducciones = Math.min(topeUMA, tope15);
  const deduccionesAplicadas = Math.min(deduccionesInput, topeDeducciones);

  const baseGravable = Math.max(0, ingresos - deduccionesAplicadas);
  const isrAnualCalculado = isrAnual2026(baseGravable); // tarifa anual 2026 (Art. 152 LISR, Anexo 8 RMF 2026)

  const saldoFavor = retenciones + subsidio - isrAnualCalculado;
  const montoDevolucion = saldoFavor > 0 ? saldoFavor : 0;
  const debePagar = saldoFavor < 0 ? Math.abs(saldoFavor) : 0;

  let mensaje = '';
  if (montoDevolucion > 0) {
    mensaje = `Tenés saldo a favor de $${montoDevolucion.toFixed(2)}. Podés solicitar devolución al SAT.`;
  } else if (debePagar > 0) {
    mensaje = `Tenés ISR por pagar: $${debePagar.toFixed(2)} en tu declaración anual.`;
  } else {
    mensaje = `Tus retenciones coinciden con el ISR anual calculado.`;
  }

  const mxn = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const topeAlcanzado = deduccionesInput > topeDeducciones;
  const notaTope = topeAlcanzado
    ? ` Ojo: tus deducciones (${mxn(deduccionesInput)}) superan el tope, así que solo se aplicaron **${mxn(deduccionesAplicadas)}** — lo demás no resta.`
    : '';

  let _insight: any;
  if (montoDevolucion > 0) {
    _insight = {
      title: 'Tenés saldo a favor',
      text: `Te retuvieron más ISR del que te tocaba: podés pedir al SAT una devolución de **${mxn(montoDevolucion)}**.${notaTope}`,
      tone: 'good',
      icon: '💸',
    };
  } else if (debePagar > 0) {
    _insight = {
      title: 'Te falta ISR por pagar',
      text: `El ISR anual (${mxn(isrAnualCalculado)}) supera tus retenciones: en tu declaración te resulta **${mxn(debePagar)}** a cargo.${notaTope}`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Tus números cuadran',
      text: `Tus retenciones coinciden con el ISR anual calculado (**${mxn(isrAnualCalculado)}**): no te devuelven ni debés pagar extra.${notaTope}`,
      tone: 'neutral',
      icon: '⚖️',
    };
  }

  return {
    saldoFavor: Number(saldoFavor.toFixed(2)),
    montoDevolucion: Number(montoDevolucion.toFixed(2)),
    debePagar: Number(debePagar.toFixed(2)),
    isrAnualCalculado: Number(isrAnualCalculado.toFixed(2)),
    deduccionesAplicadas: Number(deduccionesAplicadas.toFixed(2)),
    baseGravable: Number(baseGravable.toFixed(2)),
    topeDeducciones: Number(topeDeducciones.toFixed(2)),
    mensaje,
    _insight,
  };
}
