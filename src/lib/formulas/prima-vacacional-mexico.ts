/** Prima vacacional México según antigüedad (reforma LFT 2023) */

export interface Inputs {
  salarioDiario: number;
  aniosAntiguedad: number;
  diasVacacionesEmpresa: number;
  primaVacacionalPorc: number;
}

export interface Outputs {
  diasVacaciones: number;
  primaVacacionalBruta: number;
  exentoIsr: number;
  gravado: number;
  isrRetenido: number;
  primaVacacionalNeta: number;
  formula: string;
  explicacion: string;
}

// Tabla de vacaciones LFT Art. 76 (reforma 2023)
function diasVacacionesPorAntiguedad(anios: number): number {
  if (anios < 1) return 12;
  if (anios === 1) return 12;
  if (anios === 2) return 14;
  if (anios === 3) return 16;
  if (anios === 4) return 18;
  if (anios === 5) return 20;
  // A partir del 6to año, +2 días por cada 5 años de servicio
  if (anios <= 10) return 22;
  if (anios <= 15) return 24;
  if (anios <= 20) return 26;
  if (anios <= 25) return 28;
  if (anios <= 30) return 30;
  return 32;
}

// ISR tabla mensual
const ISR = [
  { limInf: 0.01, limSup: 746.04, cuota: 0, tasa: 1.92 },
  { limInf: 746.05, limSup: 6332.05, cuota: 14.32, tasa: 6.40 },
  { limInf: 6332.06, limSup: 11128.01, cuota: 371.83, tasa: 10.88 },
  { limInf: 11128.02, limSup: 12935.82, cuota: 893.63, tasa: 16.00 },
  { limInf: 12935.83, limSup: 15487.71, cuota: 1182.88, tasa: 17.92 },
  { limInf: 15487.72, limSup: 31236.49, cuota: 1640.18, tasa: 21.36 },
  { limInf: 31236.50, limSup: 49233.00, cuota: 5004.12, tasa: 23.52 },
  { limInf: 49233.01, limSup: 93993.90, cuota: 9236.89, tasa: 30.00 },
  { limInf: 93993.91, limSup: Infinity, cuota: 22665.17, tasa: 32.00 },
];

function calcISR(base: number): number {
  if (base <= 0) return 0;
  for (const b of ISR) {
    if (base >= b.limInf && base <= b.limSup) {
      return b.cuota + (base - b.limInf) * (b.tasa / 100);
    }
  }
  return 0;
}

export function primaVacacionalMexico(i: Inputs): Outputs {
  const salarioDiario = Number(i.salarioDiario);
  const anios = Math.max(0, Number(i.aniosAntiguedad) || 0);
  const primaPorc = Number(i.primaVacacionalPorc) || 25;

  if (!salarioDiario || salarioDiario <= 0) throw new Error('Ingresá tu salario diario');

  const diasVacCustom = Number(i.diasVacacionesEmpresa) || 0;
  const diasVacaciones = diasVacCustom > 0 ? diasVacCustom : diasVacacionesPorAntiguedad(Math.floor(anios));

  // Prima vacacional = salario diario × días vacaciones × % prima
  const primaVacacionalBruta = salarioDiario * diasVacaciones * (primaPorc / 100);

  // Exención: 15 UMA diarias (Art. 93 LISR)
  const UMA_DIARIO = 113.14;
  const exentoIsr = Math.min(primaVacacionalBruta, UMA_DIARIO * 15);
  const gravado = Math.max(0, primaVacacionalBruta - exentoIsr);
  const isrRetenido = calcISR(gravado);
  const primaVacacionalNeta = primaVacacionalBruta - isrRetenido;

  const formula = `Prima = $${salarioDiario} × ${diasVacaciones} días × ${primaPorc}% = $${primaVacacionalBruta.toFixed(2)}`;
  const explicacion = `Con ${Math.floor(anios)} año(s) de antigüedad te corresponden ${diasVacaciones} días de vacaciones. La prima vacacional (${primaPorc}%) es $${Math.round(primaVacacionalBruta).toLocaleString('es-MX')} MXN brutos. Exento de ISR: $${Math.round(exentoIsr).toLocaleString('es-MX')} (hasta 15 UMA). ISR retenido: $${Math.round(isrRetenido).toLocaleString('es-MX')}. Prima neta: $${Math.round(primaVacacionalNeta).toLocaleString('es-MX')} MXN.`;

  return {
    diasVacaciones,
    primaVacacionalBruta: Math.round(primaVacacionalBruta),
    exentoIsr: Math.round(exentoIsr),
    gravado: Math.round(gravado),
    isrRetenido: Math.round(isrRetenido),
    primaVacacionalNeta: Math.round(primaVacacionalNeta),
    formula,
    explicacion,
  };
}
