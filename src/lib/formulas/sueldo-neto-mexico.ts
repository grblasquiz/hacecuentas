/**
 * Calculadora de Sueldo Neto Mexico 2026
 * Deducciones: ISR (escala progresiva), IMSS (cuota obrera), Infonavit
 * Fuente: SAT Mexico, Ley del ISR 2026
 */

export interface SueldoNetoMexicoInputs {
  sueldoBrutoMensual: number;
  tieneInfonavit: boolean;
  porcentajeInfonavit: number;
  valesDespensa: number;
}

export interface SueldoNetoMexicoOutputs {
  sueldoNeto: number;
  isr: number;
  imss: number;
  infonavit: number;
  totalDescuentos: number;
  formula: string;
  explicacion: string;
}

// ISR 2026 Mexico - tabla mensual (Art. 96 LISR)
interface ISRBracket {
  limiteInferior: number;
  limiteSuperior: number;
  cuotaFija: number;
  porcentajeExcedente: number;
}

const ISR_BRACKETS_MENSUAL: ISRBracket[] = [
  { limiteInferior: 0.01, limiteSuperior: 746.04, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 746.05, limiteSuperior: 6332.05, cuotaFija: 14.32, porcentajeExcedente: 6.40 },
  { limiteInferior: 6332.06, limiteSuperior: 11128.01, cuotaFija: 371.83, porcentajeExcedente: 10.88 },
  { limiteInferior: 11128.02, limiteSuperior: 12935.82, cuotaFija: 893.63, porcentajeExcedente: 16.00 },
  { limiteInferior: 12935.83, limiteSuperior: 15487.71, cuotaFija: 1182.88, porcentajeExcedente: 17.92 },
  { limiteInferior: 15487.72, limiteSuperior: 31236.49, cuotaFija: 1640.18, porcentajeExcedente: 21.36 },
  { limiteInferior: 31236.50, limiteSuperior: 49233.00, cuotaFija: 5004.12, porcentajeExcedente: 23.52 },
  { limiteInferior: 49233.01, limiteSuperior: 93993.90, cuotaFija: 9236.89, porcentajeExcedente: 30.00 },
  { limiteInferior: 93993.91, limiteSuperior: 125325.20, cuotaFija: 22665.17, porcentajeExcedente: 32.00 },
  { limiteInferior: 125325.21, limiteSuperior: 375975.61, cuotaFija: 32691.18, porcentajeExcedente: 34.00 },
  { limiteInferior: 375975.62, limiteSuperior: Infinity, cuotaFija: 117912.32, porcentajeExcedente: 35.00 },
];

// Subsidio al empleo mensual (tabla vigente)
interface SubsidioRow {
  desde: number;
  hasta: number;
  subsidio: number;
}

const SUBSIDIO_EMPLEO: SubsidioRow[] = [
  { desde: 0.01, hasta: 1768.96, subsidio: 407.02 },
  { desde: 1768.97, hasta: 2653.38, subsidio: 406.83 },
  { desde: 2653.39, hasta: 3472.84, subsidio: 406.62 },
  { desde: 3472.85, hasta: 3537.87, subsidio: 392.77 },
  { desde: 3537.88, hasta: 4446.15, subsidio: 382.46 },
  { desde: 4446.16, hasta: 4717.18, subsidio: 354.23 },
  { desde: 4717.19, hasta: 5335.42, subsidio: 324.87 },
  { desde: 5335.43, hasta: 6224.67, subsidio: 294.63 },
  { desde: 6224.68, hasta: 7113.90, subsidio: 253.54 },
  { desde: 7113.91, hasta: 7382.33, subsidio: 217.61 },
  { desde: 7382.34, hasta: Infinity, subsidio: 0 },
];

function calcularISR(baseGravable: number): number {
  if (baseGravable <= 0) return 0;

  let bracket = ISR_BRACKETS_MENSUAL[0];
  for (const b of ISR_BRACKETS_MENSUAL) {
    if (baseGravable >= b.limiteInferior && baseGravable <= b.limiteSuperior) {
      bracket = b;
      break;
    }
    if (baseGravable > b.limiteSuperior) {
      bracket = b;
    }
  }

  const excedente = baseGravable - bracket.limiteInferior;
  const isrBruto = bracket.cuotaFija + excedente * (bracket.porcentajeExcedente / 100);

  // Aplicar subsidio al empleo
  let subsidio = 0;
  for (const s of SUBSIDIO_EMPLEO) {
    if (baseGravable >= s.desde && baseGravable <= s.hasta) {
      subsidio = s.subsidio;
      break;
    }
  }

  return Math.max(0, isrBruto - subsidio);
}

export function sueldoNetoMexico(inputs: SueldoNetoMexicoInputs): SueldoNetoMexicoOutputs {
  const bruto = Number(inputs.sueldoBrutoMensual);
  const tieneInfonavit = inputs.tieneInfonavit === true || inputs.tieneInfonavit === 'true' as any;
  const pctInfonavit = Number(inputs.porcentajeInfonavit) || 5;
  const valesDespensa = Number(inputs.valesDespensa) || 0;

  if (!bruto || bruto <= 0) {
    throw new Error('Ingresa tu sueldo bruto mensual');
  }

  // IMSS cuota obrera (~2.775% sobre SBC limitado)
  // Ramas: enfermedades y maternidad 0.625%, invalidez y vida 0.625%,
  // cesantia en edad avanzada y vejez 1.125%, guarderias 0%, retiro 0%
  // + prestaciones en dinero 0.25% + gastos medicos pensionados 0.375%
  const imssRate = 0.02775;
  const imss = Math.round(bruto * imssRate * 100) / 100;

  // Infonavit (descuento al trabajador solo si tiene credito activo)
  const infonavit = tieneInfonavit ? Math.round(bruto * (pctInfonavit / 100) * 100) / 100 : 0;

  // Base gravable para ISR = bruto - IMSS (deduccion personal)
  // Los vales de despensa exentos hasta el 40% de la UMA mensual (~$4,200)
  const umaAnual2026 = 113.14; // UMA diario estimado 2026
  const topeDespensaExenta = umaAnual2026 * 30 * 0.40;
  const despensaExenta = Math.min(valesDespensa, topeDespensaExenta);
  const baseGravable = bruto - imss;

  // ISR mensual
  const isr = Math.round(calcularISR(baseGravable) * 100) / 100;

  const totalDescuentos = Math.round((isr + imss + infonavit) * 100) / 100;
  const sueldoNeto = Math.round((bruto - totalDescuentos + despensaExenta) * 100) / 100;

  const formula = `Sueldo neto = $${bruto.toLocaleString('es-MX')} − ISR ($${isr.toLocaleString('es-MX')}) − IMSS ($${imss.toLocaleString('es-MX')})${tieneInfonavit ? ` − Infonavit ($${infonavit.toLocaleString('es-MX')})` : ''}${valesDespensa > 0 ? ` + Vales despensa ($${despensaExenta.toLocaleString('es-MX')})` : ''} = $${sueldoNeto.toLocaleString('es-MX')}`;

  const explicacion = `De tu sueldo bruto de $${bruto.toLocaleString('es-MX')} MXN, se descuentan: ISR $${isr.toLocaleString('es-MX')} (impuesto progresivo según tabla del Art. 96 LISR), IMSS $${imss.toLocaleString('es-MX')} (cuota obrera ~2.775%)${tieneInfonavit ? ` e Infonavit $${infonavit.toLocaleString('es-MX')} (${pctInfonavit}% por crédito activo)` : ''}. Total de descuentos: $${totalDescuentos.toLocaleString('es-MX')}. Tu sueldo neto es $${sueldoNeto.toLocaleString('es-MX')} MXN.`;

  return {
    sueldoNeto: Math.round(sueldoNeto),
    isr: Math.round(isr),
    imss: Math.round(imss),
    infonavit: Math.round(infonavit),
    totalDescuentos: Math.round(totalDescuentos),
    formula,
    explicacion,
  };
}
