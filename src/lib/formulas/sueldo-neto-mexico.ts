// Calculadora de Sueldo Neto México 2026
// Aplica tarifa ISR mensual (Art. 96 LISR), cuotas IMSS obrero (LSS) y subsidio al empleo (DOF 2026).
// Fuente: SAT, IMSS, DOF — vigente para ejercicio fiscal 2026.

export interface Inputs {
  salarioBrutoMensual: number;
  numHijosCargo?: number;
}

export interface Outputs {
  salarioNeto: number;
  isrRetenido: number;
  imssObrero: number;
  subsidioEmpleo: number;
  detalle: string;
}

// Tarifa ISR mensual SAT 2026 (Art. 96 LISR)
// [limInf, limSup, cuotaFija, tasaExcedente]
const TARIFA_ISR_MENSUAL_2026: Array<[number, number, number, number]> = [
  [0.01, 746.04, 0.0, 0.0192],
  [746.05, 6332.05, 14.32, 0.064],
  [6332.06, 11128.01, 371.83, 0.1088],
  [11128.02, 12935.82, 893.63, 0.16],
  [12935.83, 15487.71, 1182.88, 0.1792],
  [15487.72, 31236.49, 1640.18, 0.2136],
  [31236.5, 49233.0, 5004.12, 0.2352],
  [49233.01, 93993.9, 9236.89, 0.3],
  [93993.91, 125325.2, 22665.17, 0.32],
  [125325.21, 375975.61, 32691.18, 0.34],
  [375975.62, Number.POSITIVE_INFINITY, 117912.32, 0.35],
];

// Tabla Subsidio para el Empleo mensual 2026 (DOF)
// [topeIngresoMensual, subsidio]
const TABLA_SPE_2026: Array<[number, number]> = [
  [1768.96, 407.02],
  [2653.38, 406.83],
  [3472.84, 406.62],
  [3537.87, 392.77],
  [4446.15, 382.46],
  [4717.18, 354.23],
  [5335.42, 324.87],
  [6224.67, 294.63],
  [7113.9, 253.54],
  [7382.33, 217.61],
  [Number.POSITIVE_INFINITY, 0],
];

// Cuota IMSS obrero simplificada 2026 (~2.775% del SBC) — LSS Arts. 106, 107, 147, 168
// Tope: 25 UMA mensuales (UMA mensual 2026 = $3,439.46 → tope ≈ $85,986.50)
const PORCENTAJE_IMSS_OBRERO = 0.02775;
const UMA_MENSUAL_2026 = 3439.46;
const TOPE_SBC_25_UMA = UMA_MENSUAL_2026 * 25;

function calcularISRMensual(base: number): { isr: number; tramo: number } {
  if (base <= 0) return { isr: 0, tramo: 0 };
  for (let i = 0; i < TARIFA_ISR_MENSUAL_2026.length; i++) {
    const [limInf, limSup, cuotaFija, tasa] = TARIFA_ISR_MENSUAL_2026[i];
    if (base >= limInf && base <= limSup) {
      const excedente = base - limInf;
      const isr = cuotaFija + excedente * tasa;
      return { isr: Math.round(isr * 100) / 100, tramo: i + 1 };
    }
  }
  // fallback: último tramo
  const last = TARIFA_ISR_MENSUAL_2026[TARIFA_ISR_MENSUAL_2026.length - 1];
  const isr = last[2] + (base - last[0]) * last[3];
  return { isr: Math.round(isr * 100) / 100, tramo: TARIFA_ISR_MENSUAL_2026.length };
}

function calcularSPE(base: number): number {
  for (const [tope, subsidio] of TABLA_SPE_2026) {
    if (base <= tope) return subsidio;
  }
  return 0;
}

function calcularIMSSObrero(base: number): number {
  const baseTopada = Math.min(base, TOPE_SBC_25_UMA);
  return Math.round(baseTopada * PORCENTAJE_IMSS_OBRERO * 100) / 100;
}

export function sueldoNetoMexico(inputs: Inputs): Outputs {
  const bruto = Number(inputs.salarioBrutoMensual);

  if (!isFinite(bruto) || bruto <= 0) {
    return {
      salarioNeto: 0,
      isrRetenido: 0,
      imssObrero: 0,
      subsidioEmpleo: 0,
      detalle: 'Ingresa un salario bruto mensual válido mayor a cero.',
    };
  }

  // 1) ISR
  const { isr, tramo } = calcularISRMensual(bruto);

  // 2) IMSS obrero
  const imss = calcularIMSSObrero(bruto);

  // 3) Subsidio para el empleo
  const spe = calcularSPE(bruto);

  // Lógica SPE: si SPE > ISR, neto suma diferencia. Si SPE <= ISR, reduce ISR.
  let isrEfectivo = isr;
  let speEntregado = 0;

  if (spe > 0) {
    if (spe >= isr) {
      isrEfectivo = 0;
      speEntregado = spe - isr; // diferencia adicional al neto
    } else {
      isrEfectivo = isr - spe;
      speEntregado = 0; // se acreditó contra ISR, no se entrega como adicional
    }
  }

  const neto = Math.round((bruto - isrEfectivo - imss + speEntregado) * 100) / 100;

  const porcentaje = ((neto / bruto) * 100).toFixed(1);

  const detalle =
    `Bruto: $${bruto.toFixed(2)} | Tramo ISR: ${tramo}/11 | ISR: $${isr.toFixed(2)} | ` +
    `IMSS obrero (2.775%): $${imss.toFixed(2)} | ` +
    `Subsidio empleo: $${spe.toFixed(2)} (entregado al neto: $${speEntregado.toFixed(2)}) | ` +
    `Neto: $${neto.toFixed(2)} (${porcentaje}% del bruto)`;

  return {
    salarioNeto: neto,
    isrRetenido: Math.round(isrEfectivo * 100) / 100,
    imssObrero: imss,
    subsidioEmpleo: Math.round(speEntregado * 100) / 100,
    detalle,
  };
}
