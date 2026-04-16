/** ISR mensual México 2026 — según tabla Art. 96 LISR
 *  Tabla mensual vigente (basada en 2024/2025, aplicable 2026)
 */

export interface Inputs {
  ingresoMensual: number;
  deduccionesPersonales: number;
  subsidioEmpleo: string;
}

export interface Outputs {
  baseGravable: number;
  isrAnteSubsidio: number;
  subsidioEmpleoMonto: number;
  isrMensual: number;
  tasaEfectiva: number;
  tasaMarginal: number;
  ingresoNeto: number;
  formula: string;
  explicacion: string;
}

interface ISRBracket {
  limInf: number;
  limSup: number;
  cuotaFija: number;
  porcExcedente: number;
}

// Tabla ISR mensual Art. 96 LISR (2025/2026)
const TABLA_ISR: ISRBracket[] = [
  { limInf: 0.01, limSup: 746.04, cuotaFija: 0, porcExcedente: 1.92 },
  { limInf: 746.05, limSup: 6332.05, cuotaFija: 14.32, porcExcedente: 6.40 },
  { limInf: 6332.06, limSup: 11128.01, cuotaFija: 371.83, porcExcedente: 10.88 },
  { limInf: 11128.02, limSup: 12935.82, cuotaFija: 893.63, porcExcedente: 16.00 },
  { limInf: 12935.83, limSup: 15487.71, cuotaFija: 1182.88, porcExcedente: 17.92 },
  { limInf: 15487.72, limSup: 31236.49, cuotaFija: 1640.18, porcExcedente: 21.36 },
  { limInf: 31236.50, limSup: 49233.00, cuotaFija: 5004.12, porcExcedente: 23.52 },
  { limInf: 49233.01, limSup: 93993.90, cuotaFija: 9236.89, porcExcedente: 30.00 },
  { limInf: 93993.91, limSup: 125325.20, cuotaFija: 22665.17, porcExcedente: 32.00 },
  { limInf: 125325.21, limSup: 375975.61, cuotaFija: 32691.18, porcExcedente: 34.00 },
  { limInf: 375975.62, limSup: Infinity, cuotaFija: 117912.32, porcExcedente: 35.00 },
];

// Subsidio al empleo mensual (tabla 2025/2026)
const SUBSIDIO_EMPLEO: Array<{ hasta: number; subsidio: number }> = [
  { hasta: 1768.96, subsidio: 407.02 },
  { hasta: 2653.38, subsidio: 406.83 },
  { hasta: 3472.84, subsidio: 406.62 },
  { hasta: 3537.87, subsidio: 392.77 },
  { hasta: 4446.15, subsidio: 382.46 },
  { hasta: 4717.18, subsidio: 354.23 },
  { hasta: 5335.42, subsidio: 324.87 },
  { hasta: 6224.67, subsidio: 294.63 },
  { hasta: 7113.90, subsidio: 253.54 },
  { hasta: 7382.33, subsidio: 217.61 },
  { hasta: Infinity, subsidio: 0 },
];

function calcISR(base: number): { isr: number; bracket: ISRBracket } {
  if (base <= 0) return { isr: 0, bracket: TABLA_ISR[0] };
  let bracket = TABLA_ISR[0];
  for (const b of TABLA_ISR) {
    if (base >= b.limInf && base <= b.limSup) { bracket = b; break; }
    if (base > b.limSup) bracket = b;
  }
  const excedente = base - bracket.limInf;
  const isr = bracket.cuotaFija + excedente * (bracket.porcExcedente / 100);
  return { isr, bracket };
}

function calcSubsidio(ingresoMensual: number): number {
  for (const s of SUBSIDIO_EMPLEO) {
    if (ingresoMensual <= s.hasta) return s.subsidio;
  }
  return 0;
}

export function isrMexico2026(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoMensual);
  const deducciones = Number(i.deduccionesPersonales) || 0;
  const aplicaSubsidio = i.subsidioEmpleo === 'si' || i.subsidioEmpleo === 'true';

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');

  const baseGravable = Math.max(0, ingreso - deducciones);
  const { isr: isrAnteSubsidio, bracket } = calcISR(baseGravable);
  const subsidioEmpleoMonto = aplicaSubsidio ? calcSubsidio(ingreso) : 0;
  const isrMensual = Math.max(0, isrAnteSubsidio - subsidioEmpleoMonto);
  const tasaEfectiva = ingreso > 0 ? (isrMensual / ingreso) * 100 : 0;
  const tasaMarginal = bracket.porcExcedente;
  const ingresoNeto = ingreso - isrMensual;

  const formula = `ISR = $${bracket.cuotaFija.toFixed(2)} + ($${baseGravable.toFixed(2)} - $${bracket.limInf.toFixed(2)}) × ${bracket.porcExcedente}% = $${isrAnteSubsidio.toFixed(2)}`;
  const explicacion = `Con un ingreso mensual de $${ingreso.toLocaleString('es-MX')} MXN${deducciones > 0 ? ` y deducciones de $${deducciones.toLocaleString('es-MX')}` : ''}, tu base gravable es $${baseGravable.toLocaleString('es-MX')}. ISR antes de subsidio: $${isrAnteSubsidio.toFixed(2)}.${aplicaSubsidio && subsidioEmpleoMonto > 0 ? ` Subsidio al empleo: $${subsidioEmpleoMonto.toFixed(2)}.` : ''} ISR a retener: $${isrMensual.toFixed(2)} (tasa efectiva ${tasaEfectiva.toFixed(2)}%, marginal ${tasaMarginal}%). Ingreso neto: $${ingresoNeto.toFixed(2)}.`;

  return {
    baseGravable: Math.round(baseGravable * 100) / 100,
    isrAnteSubsidio: Math.round(isrAnteSubsidio * 100) / 100,
    subsidioEmpleoMonto: Math.round(subsidioEmpleoMonto * 100) / 100,
    isrMensual: Math.round(isrMensual * 100) / 100,
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    tasaMarginal,
    ingresoNeto: Math.round(ingresoNeto * 100) / 100,
    formula,
    explicacion,
  };
}
