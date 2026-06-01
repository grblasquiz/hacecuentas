/**
 * Calculadora de Aguinaldo (SAC - Sueldo Anual Complementario) Argentina
 * LCT art. 121: SAC = 50% de la mejor remuneración mensual del semestre
 * Se paga en dos cuotas: 30 de junio y 18 de diciembre
 */

export interface AguinaldoInputs {
  mejorSueldo: number;
  mesesTrabajados: number;
  __lang?: string;
}

export interface AguinaldoOutputs {
  aguinaldoBruto: number;
  aguinaldoNeto: number;
  descuentos: number;
  proporcion: string;
  _chart?: any;
  _insight?: any;
}

export function aguinaldo(inputs: AguinaldoInputs): AguinaldoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorSueldo: 'Ingresá la mejor remuneración del semestre',
      errorMeses: 'Ingresá los meses trabajados en el semestre',
      labelNeto: 'Neto',
      labelDescuentos: 'Descuentos (17%)',
      centerLabel: 'Bruto',
      proporcion: (m: number) => `${m}/6 meses trabajados`,
      ariaLabel: (neto: number, desc: number) =>
        `Composición del aguinaldo bruto: neto ${neto}, descuentos ${desc}.`,
      insightTitle: 'Tu aguinaldo en mano',
      insightText: (bruto: string, neto: string, desc: string, parcial: boolean, meses: number) =>
        `De **$${bruto}** brutos cobrás **$${neto}** en mano: se descuenta **$${desc}** (17% de aportes).` +
        (parcial
          ? ` El monto es proporcional porque trabajaste **${meses} de 6 meses** del semestre; con el semestre completo sería el doble.`
          : ` Trabajaste el semestre completo, así que cobrás el SAC sin recorte por proporción.`),
    },
    en: {
      errorSueldo: 'Enter the highest monthly salary of the semester',
      errorMeses: 'Enter the months worked in the semester',
      labelNeto: 'Net',
      labelDescuentos: 'Deductions (17%)',
      centerLabel: 'Gross',
      proporcion: (m: number) => `${m}/6 months worked`,
      ariaLabel: (neto: number, desc: number) =>
        `Annual bonus breakdown: net ${neto}, deductions ${desc}.`,
      insightTitle: 'Your take-home bonus',
      insightText: (bruto: string, neto: string, desc: string, parcial: boolean, meses: number) =>
        `Out of **$${bruto}** gross you take home **$${neto}**: **$${desc}** is deducted (17% in social-security contributions).` +
        (parcial
          ? ` The amount is prorated because you worked **${meses} of 6 months** in the semester; with the full semester it would be double.`
          : ` You worked the full semester, so you get the SAC with no proration cut.`),
    },
  } as const)[__lang];

  const mejorSueldo = Number(inputs.mejorSueldo);
  const mesesTrabajados = Math.min(6, Math.max(0, Number(inputs.mesesTrabajados)));

  if (!mejorSueldo || mejorSueldo <= 0) {
    throw new Error(T.errorSueldo);
  }
  if (!mesesTrabajados) {
    throw new Error(T.errorMeses);
  }

  // SAC proporcional: mejor_sueldo × (meses_trabajados / 12) -> según LCT art 122
  // Simplificación común: (mejor sueldo / 2) × (meses / 6)
  const aguinaldoBruto = (mejorSueldo / 2) * (mesesTrabajados / 6);

  // Descuentos sobre aguinaldo: 17% aportes (mismos que sueldo)
  const descuentos = aguinaldoBruto * 0.17;
  const aguinaldoNeto = aguinaldoBruto - descuentos;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.labelNeto, value: Math.round(aguinaldoNeto) },
      { label: T.labelDescuentos, value: Math.round(descuentos) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(aguinaldoBruto).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel(Math.round(aguinaldoNeto), Math.round(descuentos)),
  };

  const brutoR = Math.round(aguinaldoBruto);
  const netoR = Math.round(aguinaldoNeto);
  const descR = Math.round(descuentos);
  const esParcial = mesesTrabajados < 6;

  const insight = {
    title: T.insightTitle,
    text: T.insightText(
      brutoR.toLocaleString('es-AR'),
      netoR.toLocaleString('es-AR'),
      descR.toLocaleString('es-AR'),
      esParcial,
      mesesTrabajados
    ),
    tone: 'neutral' as const,
    icon: '💵',
  };

  return {
    aguinaldoBruto: brutoR,
    aguinaldoNeto: netoR,
    descuentos: descR,
    proporcion: T.proporcion(mesesTrabajados),
    _chart: chart,
    _insight: insight,
  };
}
