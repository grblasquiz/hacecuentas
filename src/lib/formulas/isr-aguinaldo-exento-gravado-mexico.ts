/** ISR sobre el aguinaldo: exento vs gravado — México 2026.
 *  Exención de 30 UMA diarias (LISR Art. 93-XIV). El ISR del gravado se calcula
 *  con el método de tasa efectiva del Art. 142 RLISR: ISR(sueldo+gravado) − ISR(sueldo),
 *  prorrateado sobre el gravado.
 *  Datos (UMA diaria, tarifa ISR mensual): fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrMensual2026 } from '../data/mexico-2026';

export interface Inputs {
  aguinaldoBruto: number;
  salarioMensualOrdinario: number;
  __lang?: string;
}

export interface Outputs {
  exento: number;
  gravado: number;
  isrAguinaldo: number;
  neto: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function isrAguinaldoExentoGravadoMexico(i: Inputs): Outputs {
  const aguinaldoBruto = Number(i.aguinaldoBruto) || 0;
  const salario = Number(i.salarioMensualOrdinario) || 0;

  if (aguinaldoBruto <= 0) throw new Error('Ingresá el monto bruto de tu aguinaldo');

  // Exención: 30 UMA diarias (LISR Art. 93-XIV) = 30 × $117.31 = $3,519.30.
  const topeExento = MEXICO_2026.exencionesIsrUmas.aguinaldo * MEXICO_2026.uma.diaria;
  const exento = Math.min(aguinaldoBruto, topeExento);
  const gravado = Math.max(0, aguinaldoBruto - exento);

  // Método de tasa efectiva (Art. 142 RLISR): ISR marginal del gravado sumado al sueldo.
  const isrSueldo = isrMensual2026(salario);
  const isrSueldoMas = isrMensual2026(salario + gravado);
  const tasaEf = gravado > 0 ? (isrSueldoMas - isrSueldo) / gravado : 0;
  const isrAguinaldo = Math.round(gravado * tasaEf);
  const neto = aguinaldoBruto - isrAguinaldo;

  const formula = `Exento = mín($${Math.round(aguinaldoBruto).toLocaleString('es-MX')}, 30 UMA=$${Math.round(topeExento).toLocaleString('es-MX')}) = $${Math.round(exento).toLocaleString('es-MX')}; gravado = $${Math.round(gravado).toLocaleString('es-MX')}; ISR ≈ $${Math.round(isrAguinaldo).toLocaleString('es-MX')}; neto = $${Math.round(neto).toLocaleString('es-MX')}`;
  const explicacion = `De tu aguinaldo bruto de $${Math.round(aguinaldoBruto).toLocaleString('es-MX')}, $${Math.round(exento).toLocaleString('es-MX')} quedan exentos (30 UMA = $${Math.round(topeExento).toLocaleString('es-MX')}) y $${Math.round(gravado).toLocaleString('es-MX')} son gravados. Aplicando el método de tasa efectiva (Art. 142 RLISR) con tu sueldo de $${Math.round(salario).toLocaleString('es-MX')}, el ISR sobre el aguinaldo es ≈ $${Math.round(isrAguinaldo).toLocaleString('es-MX')} (tasa efectiva ${(tasaEf * 100).toFixed(2)}%). Te quedan $${Math.round(neto).toLocaleString('es-MX')} netos.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'ISR', value: Math.round(isrAguinaldo) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(aguinaldoBruto).toLocaleString('es-MX'),
    centerLabel: 'Bruto',
    ariaLabel: `Aguinaldo bruto ${Math.round(aguinaldoBruto)}: neto ${Math.round(neto)}, ISR ${Math.round(isrAguinaldo)}.`,
  };

  let insight: any;
  if (isrAguinaldo <= 0) {
    insight = {
      title: 'Aguinaldo sin ISR',
      text: `Tu aguinaldo de **$${Math.round(aguinaldoBruto).toLocaleString('es-MX')}** queda totalmente exento (no supera 30 UMA). Lo cobrás completo.`,
      tone: 'good' as const,
      icon: '🎉',
    };
  } else {
    insight = {
      title: 'El ISR recorta tu aguinaldo',
      text: `Solo se grava lo que pasa de 30 UMA ($${Math.round(topeExento).toLocaleString('es-MX')}). El ISR se lleva **$${Math.round(isrAguinaldo).toLocaleString('es-MX')}** y te quedan **$${Math.round(neto).toLocaleString('es-MX')}** netos.`,
      tone: 'warn' as const,
      icon: '🎄',
    };
  }

  return {
    exento: Math.round(exento),
    gravado: Math.round(gravado),
    isrAguinaldo: Math.round(isrAguinaldo),
    neto: Math.round(neto),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
