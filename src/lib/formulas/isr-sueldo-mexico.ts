/**
 * Calculadora de ISR sobre sueldo México
 * Tabla mensual SAT (Ley ISR art. 96)
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  sueldoBrutoMensual: number;
  subsidioEmpleo?: number;
}

export interface Outputs {
  isrRetencion: number;
  subsidio: number;
  isrNeto: number;
  sueldoNeto: number;
  tramoAplicado: string;
  mensaje: string;
}

// Tabla ISR mensual 2026 (proyectada: 2025 +5%)
// Valores proyectados 2026, validar contra fuente oficial
const TABLA_ISR_2026 = [
  { limInf: 0.01,     limSup: 825.06,     cuotaFija: 0.00,      tasa: 1.92 },
  { limInf: 825.07,   limSup: 7005.38,    cuotaFija: 15.84,     tasa: 6.40 },
  { limInf: 7005.39,  limSup: 12313.84,   cuotaFija: 411.39,    tasa: 10.88 },
  { limInf: 12313.85, limSup: 14315.91,   cuotaFija: 988.96,    tasa: 16.00 },
  { limInf: 14315.92, limSup: 17140.21,   cuotaFija: 1309.28,   tasa: 17.92 },
  { limInf: 17140.22, limSup: 34573.19,   cuotaFija: 1815.48,   tasa: 21.36 },
  { limInf: 34573.20, limSup: 54467.57,   cuotaFija: 5539.97,   tasa: 23.52 },
  { limInf: 54467.58, limSup: 103968.04,  cuotaFija: 10218.23,  tasa: 30.00 },
  { limInf: 103968.05,limSup: 138624.06,  cuotaFija: 25068.37,  tasa: 32.00 },
  { limInf: 138624.07,limSup: 415872.18,  cuotaFija: 36158.29,  tasa: 34.00 },
  { limInf: 415872.19,limSup: Infinity,   cuotaFija: 130421.10, tasa: 35.00 },
];

export function isrSueldoMexico(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoBrutoMensual);
  const subsidioInput = Number(i.subsidioEmpleo ?? 0);

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo bruto mensual');

  const tramo = TABLA_ISR_2026.find(t => sueldo >= t.limInf && sueldo <= t.limSup)!;
  const excedente = sueldo - tramo.limInf;
  const isrRetencion = tramo.cuotaFija + (excedente * tramo.tasa / 100);

  // Subsidio al empleo (aplica sólo si sueldo <= ~10,171 aprox. 2026)
  let subsidio = subsidioInput;
  if (subsidio === 0 && sueldo <= 10171) {
    subsidio = 475; // subsidio aprox 2026
  }

  const isrNeto = Math.max(0, isrRetencion - subsidio);
  const sueldoNeto = sueldo - isrNeto;
  const tramoAplicado = `Tramo ${tramo.tasa}% (límite inferior $${tramo.limInf.toFixed(2)})`;

  return {
    isrRetencion: Number(isrRetencion.toFixed(2)),
    subsidio: Number(subsidio.toFixed(2)),
    isrNeto: Number(isrNeto.toFixed(2)),
    sueldoNeto: Number(sueldoNeto.toFixed(2)),
    tramoAplicado,
    mensaje: `Con sueldo bruto $${sueldo.toFixed(2)} pagás ISR de $${isrNeto.toFixed(2)} y te quedan $${sueldoNeto.toFixed(2)} netos.`,
  };
}
