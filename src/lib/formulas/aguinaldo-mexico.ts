/**
 * Calculadora de Aguinaldo Mexico 2026
 * LFT Art. 87: minimo 15 dias de salario, pagado antes del 20 de diciembre
 * ISR: exento hasta 30 UMA (Art. 93 LISR)
 */

export interface AguinaldoMexicoInputs {
  salarioDiario: number;
  diasAguinaldo: number;
  diasTrabajados: number;
  aniosAntiguedad: number;
}

export interface AguinaldoMexicoOutputs {
  aguinaldoBruto: number;
  exentoIsr: number;
  gravadoIsr: number;
  isrAguinaldo: number;
  aguinaldoNeto: number;
  formula: string;
  explicacion: string;
}

// ISR 2026 Mexico - tabla mensual
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

function calcularISRSobreGravado(gravado: number): number {
  if (gravado <= 0) return 0;

  // Usamos la tabla mensual directamente sobre el monto gravado del aguinaldo
  // (procedimiento simplificado Art. 174 RISR)
  let bracket = ISR_BRACKETS_MENSUAL[0];
  for (const b of ISR_BRACKETS_MENSUAL) {
    if (gravado >= b.limiteInferior && gravado <= b.limiteSuperior) {
      bracket = b;
      break;
    }
    if (gravado > b.limiteSuperior) {
      bracket = b;
    }
  }

  const excedente = gravado - bracket.limiteInferior;
  return bracket.cuotaFija + excedente * (bracket.porcentajeExcedente / 100);
}

export function aguinaldoMexico(inputs: AguinaldoMexicoInputs): AguinaldoMexicoOutputs {
  const salarioDiario = Number(inputs.salarioDiario);
  const diasAguinaldo = Number(inputs.diasAguinaldo) || 15;
  const diasTrabajados = Math.min(365, Math.max(1, Number(inputs.diasTrabajados) || 365));
  const aniosAntiguedad = Number(inputs.aniosAntiguedad) || 0;

  if (!salarioDiario || salarioDiario <= 0) {
    throw new Error('Ingresa tu salario diario');
  }

  // Aguinaldo bruto proporcional
  const aguinaldoBruto = salarioDiario * diasAguinaldo * (diasTrabajados / 365);

  // Exencion ISR: hasta 30 veces la UMA diaria (Art. 93 fraccion XIV LISR)
  // UMA diario 2026 estimado: $113.14
  const umaDiario2026 = 113.14;
  const exentoIsr = Math.min(aguinaldoBruto, umaDiario2026 * 30);

  // Parte gravada
  const gravadoIsr = Math.max(0, aguinaldoBruto - exentoIsr);

  // ISR sobre la parte gravada (procedimiento Art. 174 RISR)
  const isrAguinaldo = Math.round(calcularISRSobreGravado(gravadoIsr) * 100) / 100;

  const aguinaldoNeto = aguinaldoBruto - isrAguinaldo;

  const proporcional = diasTrabajados < 365 ? ` (proporcional ${diasTrabajados}/365 dias)` : '';

  const formula = `Aguinaldo = $${salarioDiario.toLocaleString('es-MX')} x ${diasAguinaldo} dias x (${diasTrabajados}/365) = $${Math.round(aguinaldoBruto).toLocaleString('es-MX')}`;

  const explicacion = `Tu aguinaldo bruto${proporcional} es de $${Math.round(aguinaldoBruto).toLocaleString('es-MX')} MXN. De ese monto, $${Math.round(exentoIsr).toLocaleString('es-MX')} estan exentos de ISR (hasta 30 UMA = $${Math.round(umaDiario2026 * 30).toLocaleString('es-MX')}). La parte gravada es $${Math.round(gravadoIsr).toLocaleString('es-MX')}, sobre la cual se retiene ISR de $${Math.round(isrAguinaldo).toLocaleString('es-MX')}. Tu aguinaldo neto es $${Math.round(aguinaldoNeto).toLocaleString('es-MX')} MXN.${aniosAntiguedad > 0 ? ` Llevas ${aniosAntiguedad} año(s) de antigüedad.` : ''}`;

  return {
    aguinaldoBruto: Math.round(aguinaldoBruto),
    exentoIsr: Math.round(exentoIsr),
    gravadoIsr: Math.round(gravadoIsr),
    isrAguinaldo: Math.round(isrAguinaldo),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    formula,
    explicacion,
  };
}
