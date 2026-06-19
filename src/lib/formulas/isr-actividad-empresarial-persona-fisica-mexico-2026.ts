/**
 * ISR de personas físicas con ACTIVIDAD EMPRESARIAL — Régimen General
 * Título IV, Capítulo II, Sección I de la LISR (Arts. 100, 106 y 152).
 *
 * Pago provisional mensual (Art. 106): sobre la utilidad fiscal del periodo
 *   (ingresos acumulables − deducciones autorizadas) se aplica la tarifa mensual del Art. 96.
 *   Para una estimación de un solo mes usamos la tarifa mensual directa (sin acumular periodos previos).
 * Cálculo anual (Art. 152): sobre la base gravable anual
 *   (utilidad fiscal anual − deducciones personales del Art. 151) se aplica la tarifa anual.
 *
 * Las tarifas 2026 (Anexo 8 RMF 2026, DOF 28-dic-2025) viven en src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrMensual2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  ingresosPeriodo: number;       // ingresos acumulables del mes (cobrados, sin IVA)
  deduccionesPeriodo: number;    // deducciones autorizadas del mes (gastos indispensables)
  periodo?: 'mensual' | 'anual'; // si los montos son de un mes o de todo el año
  deduccionesPersonales?: number; // solo en anual: gastos médicos, colegiaturas, etc. (Art. 151)
}

export interface Outputs {
  utilidadFiscal: number;        // base gravable (ingresos − deducciones autorizadas)
  baseGravable: number;          // utilidad fiscal − deducciones personales (= utilidad en mensual)
  isr: number;                   // ISR del periodo (provisional mensual o anual)
  margenUtilidad: number;        // % de utilidad sobre ingresos
  tasaEfectiva: number;          // ISR / ingresos, en %
  netoDespuesIsr: number;        // utilidad fiscal − ISR
  esAnual: boolean;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function compute(i: Inputs): Outputs {
  const ingresos = Math.max(0, num(i.ingresosPeriodo));
  if (ingresos <= 0) throw new Error('Ingresá los ingresos del periodo');

  const deduccionesAut = Math.max(0, num(i.deduccionesPeriodo));
  const esAnual = i.periodo === 'anual';

  // Utilidad fiscal = ingresos acumulables − deducciones autorizadas (Art. 100/106).
  // Las deducciones no pueden superar a los ingresos: si dan pérdida, la base es 0.
  const utilidadFiscal = Math.max(0, ingresos - deduccionesAut);

  // Deducciones personales (Art. 151): solo aplican en el cálculo ANUAL.
  // Tope global: el MENOR entre 5 UMA anuales y el 15% del total de ingresos.
  let deduccionesPersonales = 0;
  if (esAnual) {
    const solicitadas = Math.max(0, num(i.deduccionesPersonales));
    const topeUma = MEXICO_2026.uma.anual * MEXICO_2026.deduccionesPersonales.topeUmasAnuales; // 5 UMA
    const topePct = ingresos * MEXICO_2026.deduccionesPersonales.topePorcentajeIngresos;        // 15%
    const topeGlobal = Math.min(topeUma, topePct);
    deduccionesPersonales = Math.min(solicitadas, topeGlobal);
  }

  const baseGravable = Math.max(0, utilidadFiscal - deduccionesPersonales);

  // Tarifa: anual (Art. 152) o mensual (Art. 96, vía Art. 106).
  const isr = esAnual ? isrAnual2026(baseGravable) : isrMensual2026(baseGravable);

  const margenUtilidad = ingresos > 0 ? Math.round((utilidadFiscal / ingresos) * 1000) / 10 : 0;
  const tasaEfectiva = ingresos > 0 ? Math.round((isr / ingresos) * 1000) / 10 : 0;
  const netoDespuesIsr = utilidadFiscal - isr;
  const periodoTxt = esAnual ? 'del ejercicio' : 'del mes';

  const _insight = {
    title: esAnual ? 'ISR anual (Art. 152)' : 'Pago provisional del mes (Art. 106)',
    text: esAnual
      ? `Sobre una utilidad fiscal anual de **${fmtMXN(utilidadFiscal)}**${deduccionesPersonales > 0 ? ` (menos **${fmtMXN(deduccionesPersonales)}** de deducciones personales)` : ''} tu base gravable es **${fmtMXN(baseGravable)}** y el ISR del ejercicio es **${fmtMXN(isr)}** (tasa efectiva **${tasaEfectiva}%** sobre ingresos). A este monto le restás los pagos provisionales y retenciones del año para saber si pagás o tenés saldo a favor.`
      : `Ingresos del mes **${fmtMXN(ingresos)}** menos deducciones autorizadas **${fmtMXN(deduccionesAut)}** = utilidad fiscal **${fmtMXN(utilidadFiscal)}**. Aplicando la tarifa mensual del Art. 96, tu pago provisional es **${fmtMXN(isr)}** (tasa efectiva **${tasaEfectiva}%** sobre ingresos). Se paga a más tardar el día 17 del mes siguiente.`,
    tone: 'neutral',
    icon: '🇲🇽',
  };

  const out: Outputs = {
    utilidadFiscal: Number(utilidadFiscal.toFixed(2)),
    baseGravable: Number(baseGravable.toFixed(2)),
    isr: Number(isr.toFixed(2)),
    margenUtilidad,
    tasaEfectiva,
    netoDespuesIsr: Number(netoDespuesIsr.toFixed(2)),
    esAnual,
    mensaje: esAnual
      ? `Con utilidad fiscal anual de ${fmtMXN(utilidadFiscal)}, el ISR del ejercicio es ${fmtMXN(isr)}.`
      : `Con utilidad de ${fmtMXN(utilidadFiscal)} en el mes, tu pago provisional de ISR es ${fmtMXN(isr)}.`,
    _insight,
  };

  // Donut: cómo se reparten los ingresos ${periodoTxt} entre deducciones, ISR y neto.
  if (ingresos > 0) {
    const slices = [
      { label: 'Neto después de ISR', value: Number(Math.max(0, netoDespuesIsr).toFixed(2)) },
      { label: 'ISR', value: Number(isr.toFixed(2)) },
    ];
    if (deduccionesAut > 0) slices.push({ label: 'Deducciones autorizadas', value: Number(deduccionesAut.toFixed(2)) });
    out._chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtMXN(ingresos),
      centerLabel: `Ingresos ${periodoTxt}`,
      ariaLabel: `Reparto de los ingresos ${periodoTxt} entre deducciones autorizadas, ISR y neto para el dueño`,
    };
  }

  return out;
}
