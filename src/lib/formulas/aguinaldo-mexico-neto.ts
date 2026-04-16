/** Aguinaldo neto México con desglose ISR detallado
 *  Diferenciado del aguinaldo-mexico existente: foco en neto + tabla ISR completa
 *  + comparativa con salario mensual
 */

export interface Inputs {
  sueldoMensual: number;
  diasAguinaldo: number;
  mesesTrabajados: number;
  tieneCredito: string;
}

export interface Outputs {
  aguinaldoBruto: number;
  exentoIsr: number;
  gravado: number;
  isrRetenido: number;
  aguinaldoNeto: number;
  equivalenteSueldos: number;
  formula: string;
  explicacion: string;
}

// ISR tabla Art. 96 mensual
const ISR_MENSUAL = [
  { limInf: 0.01, limSup: 746.04, cuota: 0, tasa: 1.92 },
  { limInf: 746.05, limSup: 6332.05, cuota: 14.32, tasa: 6.40 },
  { limInf: 6332.06, limSup: 11128.01, cuota: 371.83, tasa: 10.88 },
  { limInf: 11128.02, limSup: 12935.82, cuota: 893.63, tasa: 16.00 },
  { limInf: 12935.83, limSup: 15487.71, cuota: 1182.88, tasa: 17.92 },
  { limInf: 15487.72, limSup: 31236.49, cuota: 1640.18, tasa: 21.36 },
  { limInf: 31236.50, limSup: 49233.00, cuota: 5004.12, tasa: 23.52 },
  { limInf: 49233.01, limSup: 93993.90, cuota: 9236.89, tasa: 30.00 },
  { limInf: 93993.91, limSup: 125325.20, cuota: 22665.17, tasa: 32.00 },
  { limInf: 125325.21, limSup: 375975.61, cuota: 32691.18, tasa: 34.00 },
  { limInf: 375975.62, limSup: Infinity, cuota: 117912.32, tasa: 35.00 },
];

function calcISR(base: number): number {
  if (base <= 0) return 0;
  for (const b of ISR_MENSUAL) {
    if (base >= b.limInf && base <= b.limSup) {
      return b.cuota + (base - b.limInf) * (b.tasa / 100);
    }
  }
  const last = ISR_MENSUAL[ISR_MENSUAL.length - 1];
  return last.cuota + (base - last.limInf) * (last.tasa / 100);
}

export function aguinaldoMexicoNeto(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual);
  const diasAg = Number(i.diasAguinaldo) || 15;
  const mesesT = Math.min(12, Math.max(1, Number(i.mesesTrabajados) || 12));

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const salarioDiario = sueldo / 30;
  const aguinaldoBruto = salarioDiario * diasAg * (mesesT / 12);

  // Exención: 30 UMA diarias (UMA 2026 ≈ $113.14)
  const UMA_DIARIO = 113.14;
  const exentoIsr = Math.min(aguinaldoBruto, UMA_DIARIO * 30);
  const gravado = Math.max(0, aguinaldoBruto - exentoIsr);
  const isrRetenido = calcISR(gravado);
  const aguinaldoNeto = aguinaldoBruto - isrRetenido;
  const equivalenteSueldos = sueldo > 0 ? aguinaldoNeto / sueldo : 0;

  const formula = `Neto = ($${salarioDiario.toFixed(2)} × ${diasAg} × ${mesesT}/12) - ISR($${gravado.toFixed(2)}) = $${aguinaldoNeto.toFixed(2)}`;
  const explicacion = `Con sueldo mensual de $${sueldo.toLocaleString('es-MX')} MXN (diario: $${salarioDiario.toFixed(2)}) y ${diasAg} días de aguinaldo${mesesT < 12 ? ` (proporcional ${mesesT} meses)` : ''}: bruto $${Math.round(aguinaldoBruto).toLocaleString('es-MX')}, exento $${Math.round(exentoIsr).toLocaleString('es-MX')}, gravado $${Math.round(gravado).toLocaleString('es-MX')}, ISR $${Math.round(isrRetenido).toLocaleString('es-MX')}. Neto en mano: $${Math.round(aguinaldoNeto).toLocaleString('es-MX')} MXN (equivale a ${equivalenteSueldos.toFixed(2)} sueldos).`;

  return {
    aguinaldoBruto: Math.round(aguinaldoBruto),
    exentoIsr: Math.round(exentoIsr),
    gravado: Math.round(gravado),
    isrRetenido: Math.round(isrRetenido),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    equivalenteSueldos: Number(equivalenteSueldos.toFixed(2)),
    formula,
    explicacion,
  };
}
