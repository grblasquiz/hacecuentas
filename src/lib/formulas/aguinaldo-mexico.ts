/**
 * Calculadora de Aguinaldo Mexico 2026
 * LFT Art. 87: minimo 15 dias de salario, pagado antes del 20 de diciembre
 * ISR: exento hasta 30 UMA (Art. 93 LISR)
 *
 * Datos fiscales (UMA 2026, tarifa ISR mensual 2026, exención 30 UMA): fuente única
 * src/lib/data/mexico-2026.ts. Antes la tarifa ISR y la UMA estaban hardcodeadas con
 * valores 2025 (UMA $113.14, tabla mensual vieja).
 */
import { MEXICO_2026, isrMensual2026 } from '../data/mexico-2026';

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
  _chart?: any;
  _insight?: any;
}

// ISR sobre el monto gravado del aguinaldo: tarifa mensual 2026 directa
// (procedimiento simplificado Art. 174 RISR), desde la fuente única mexico-2026.
function calcularISRSobreGravado(gravado: number): number {
  if (gravado <= 0) return 0;
  return isrMensual2026(gravado);
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

  // Exencion ISR: hasta 30 veces la UMA diaria (Art. 93 fraccion XIV LISR).
  // UMA diaria 2026 y tope de 30 UMA: fuente única mexico-2026.
  const umaDiario2026 = MEXICO_2026.uma.diaria;
  const exentoIsr = Math.min(aguinaldoBruto, umaDiario2026 * MEXICO_2026.exencionesIsrUmas.aguinaldo);

  // Parte gravada
  const gravadoIsr = Math.max(0, aguinaldoBruto - exentoIsr);

  // ISR sobre la parte gravada (procedimiento Art. 174 RISR)
  const isrAguinaldo = Math.round(calcularISRSobreGravado(gravadoIsr) * 100) / 100;

  const aguinaldoNeto = aguinaldoBruto - isrAguinaldo;

  const proporcional = diasTrabajados < 365 ? ` (proporcional ${diasTrabajados}/365 dias)` : '';

  const formula = `Aguinaldo = $${salarioDiario.toLocaleString('es-MX')} x ${diasAguinaldo} dias x (${diasTrabajados}/365) = $${Math.round(aguinaldoBruto).toLocaleString('es-MX')}`;

  const explicacion = `Tu aguinaldo bruto${proporcional} es de $${Math.round(aguinaldoBruto).toLocaleString('es-MX')} MXN. De ese monto, $${Math.round(exentoIsr).toLocaleString('es-MX')} estan exentos de ISR (hasta 30 UMA = $${Math.round(umaDiario2026 * 30).toLocaleString('es-MX')}). La parte gravada es $${Math.round(gravadoIsr).toLocaleString('es-MX')}, sobre la cual se retiene ISR de $${Math.round(isrAguinaldo).toLocaleString('es-MX')}. Tu aguinaldo neto es $${Math.round(aguinaldoNeto).toLocaleString('es-MX')} MXN.${aniosAntiguedad > 0 ? ` Llevas ${aniosAntiguedad} año(s) de antigüedad.` : ''}`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto en mano', value: Math.round(aguinaldoNeto) },
      { label: 'ISR retenido', value: Math.round(isrAguinaldo) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(aguinaldoBruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: `Composición del aguinaldo bruto: neto ${Math.round(aguinaldoNeto)}, ISR retenido ${Math.round(isrAguinaldo)}.`,
  };

  // Insight narrativo: cuánto neto cobrás y qué proporción del bruto se lleva el ISR.
  const isrPct = aguinaldoBruto > 0 ? (isrAguinaldo / aguinaldoBruto) * 100 : 0;
  const netoRound = Math.round(aguinaldoNeto);
  const isrRound = Math.round(isrAguinaldo);
  let insight: any;
  if (isrRound <= 0) {
    insight = {
      title: 'Aguinaldo libre de ISR',
      text: `Cobrás los **$${netoRound.toLocaleString('es-MX')} MXN** completos: tu aguinaldo no supera las 30 UMA exentas ($${Math.round(umaDiario2026 * 30).toLocaleString('es-MX')}), así que no se retiene ISR.`,
      tone: 'good' as const,
      icon: '🎉',
    };
  } else {
    insight = {
      title: 'El ISR te descuenta del aguinaldo',
      text: `De **$${Math.round(aguinaldoBruto).toLocaleString('es-MX')}** brutos, el ISR retiene **$${isrRound.toLocaleString('es-MX')}** (el **${isrPct.toFixed(1)}%**) y te quedan **$${netoRound.toLocaleString('es-MX')} MXN** netos. Solo se grava lo que excede las 30 UMA exentas.`,
      tone: 'warn' as const,
      icon: '🎄',
    };
  }

  return {
    aguinaldoBruto: Math.round(aguinaldoBruto),
    exentoIsr: Math.round(exentoIsr),
    gravadoIsr: Math.round(gravadoIsr),
    isrAguinaldo: Math.round(isrAguinaldo),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
