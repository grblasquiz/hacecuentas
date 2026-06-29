/**
 * Aguinaldo proporcional por renuncia (o por trabajar parte del año) — México 2026.
 *
 * Aguinaldo proporcional = salarioDiario × díasAguinaldoAnual × (díasTrabajados / 365).
 * Exención ISR: 30 UMA diarias (LISR Art. 93 fracc. XIV). Sobre el excedente gravado
 * se aplica la tarifa mensual (Art. 96 LISR) por el método marginal: se compara el ISR
 * del sueldo mensual ordinario con y sin la parte gravada del aguinaldo, y la tasa
 * efectiva resultante se aplica al monto gravado (procedimiento Art. 142 RLISR).
 *
 * Datos fiscales (UMA 2026, tarifa ISR mensual, exención 30 UMA, mínimo 15 días LFT Art. 87):
 * fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrMensual2026 } from '../data/mexico-2026';

export interface Inputs {
  salarioDiario: number;
  diasAguinaldoAnual: number;
  diasTrabajadosAnio: number;
}

export interface Outputs {
  aguinaldoProporcional: number;
  exento: number;
  gravado: number;
  isr: number;
  neto: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function aguinaldoProporcionalRenunciaMexico(i: Inputs): Outputs {
  const salarioDiario = Number(i.salarioDiario);
  const diasAg = Number(i.diasAguinaldoAnual) || MEXICO_2026.lft.aguinaldoDiasMinimo;
  const diasTrab = Math.max(0, Math.min(366, Number(i.diasTrabajadosAnio) || 365));

  if (!salarioDiario || salarioDiario <= 0) throw new Error('Ingresá tu salario diario');

  const aguinaldoProporcional = salarioDiario * diasAg * (diasTrab / 365);

  // Exención: 30 UMA diarias (Art. 93 LISR). UMA 2026 y tope: fuente única mexico-2026.
  const exencionTope = MEXICO_2026.uma.diaria * MEXICO_2026.exencionesIsrUmas.aguinaldo;
  const exento = Math.min(aguinaldoProporcional, exencionTope);
  const gravado = Math.max(0, aguinaldoProporcional - exento);

  // Método marginal Art. 142 RLISR: tasa efectiva = ΔISR / gravado sobre el sueldo mensual.
  const sueldoMensual = salarioDiario * 30;
  const isrSueldo = isrMensual2026(sueldoMensual);
  const isrSueldoMas = isrMensual2026(sueldoMensual + gravado);
  const isr = gravado > 0 ? Math.round((isrSueldoMas - isrSueldo) * 100) / 100 : 0;
  const neto = aguinaldoProporcional - isr;

  const f = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const detalle =
    `Trabajaste ${diasTrab} de 365 días: aguinaldo proporcional ${f(aguinaldoProporcional)} ` +
    `(${salarioDiario.toLocaleString('es-MX')} × ${diasAg} días × ${diasTrab}/365). ` +
    `Exento ${f(exento)} (30 UMA), gravado ${f(gravado)}, ISR ${f(isr)}. Neto: ${f(neto)}.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto en mano', value: Math.round(neto) },
      { label: 'ISR retenido', value: Math.round(isr) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(aguinaldoProporcional).toLocaleString('es-MX'),
    centerLabel: 'Bruto',
    ariaLabel: `Aguinaldo proporcional ${Math.round(aguinaldoProporcional)}: neto ${Math.round(neto)}, ISR ${Math.round(isr)}.`,
  };

  let insight: any;
  if (isr <= 0) {
    insight = {
      title: 'Aguinaldo proporcional sin ISR',
      text: `Te corresponden **${f(aguinaldoProporcional)}** de aguinaldo proporcional por tus ${diasTrab} días trabajados, y queda **exento de ISR** (no supera las 30 UMA). Lo cobrás completo: tu patrón debe pagarlo en el finiquito.`,
      tone: 'good' as const,
      icon: '🎄',
    };
  } else {
    insight = {
      title: 'Lo que cobrás de aguinaldo al renunciar',
      text: `Por renunciar tras ${diasTrab} días te corresponden **${f(aguinaldoProporcional)}** de aguinaldo proporcional. El ISR se lleva **${f(isr)}** (solo grava lo que pasa de 30 UMA) y te quedan **${f(neto)}** netos, que se suman al finiquito.`,
      tone: 'neutral' as const,
      icon: '🧾',
    };
  }

  return {
    aguinaldoProporcional: Math.round(aguinaldoProporcional * 100) / 100,
    exento: Math.round(exento * 100) / 100,
    gravado: Math.round(gravado * 100) / 100,
    isr: Math.round(isr * 100) / 100,
    neto: Math.round(neto * 100) / 100,
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
