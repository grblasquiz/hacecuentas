/**
 * Calculadora de embargo de sueldo — porcentaje máximo
 * LCT Art. 147 + Decreto 484/87
 * Hasta 1 SMVM: inembargable. 1-2 SMVM: 10% excedente. >2 SMVM: 20% excedente.
 * Alimentaria: hasta 33% del neto total.
 */

export interface EmbargoSueldoPorcentajeMaximoInputs {
  sueldoNeto: number;
  smvm: number;
  esAlimentaria: string;
}

export interface EmbargoSueldoPorcentajeMaximoOutputs {
  montoEmbargable: number;
  porcentajeAplicado: string;
  sueldoPostEmbargo: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function embargoSueldoPorcentajeMaximo(
  inputs: EmbargoSueldoPorcentajeMaximoInputs
): EmbargoSueldoPorcentajeMaximoOutputs {
  const neto = Number(inputs.sueldoNeto);
  const smvm = Number(inputs.smvm);
  const esAlimentaria = inputs.esAlimentaria === 'si';

  if (!neto || neto <= 0) throw new Error('Ingresá tu sueldo neto');
  if (!smvm || smvm <= 0) throw new Error('Ingresá el SMVM vigente');

  if (esAlimentaria) {
    // Cuota alimentaria: hasta 33% del neto total (el juez define)
    const maxAlimentaria = neto * 0.33;
    const embA = Math.round(maxAlimentaria);
    const postA = Math.round(neto - maxAlimentaria);
    return {
      montoEmbargable: embA,
      porcentajeAplicado: '33% del sueldo neto (tope alimentaria)',
      sueldoPostEmbargo: postA,
      detalle: `Por cuota alimentaria, el tope embargable es hasta el 33% del sueldo neto: $${embA.toLocaleString('es-AR')}/mes. Te quedarían $${postA.toLocaleString('es-AR')}. El juez define el monto exacto según las necesidades del alimentado.`,
      _insight: {
        title: 'Tope por cuota alimentaria',
        text: `Por alimentos no hay mínimo inembargable: pueden retenerte hasta el **33%** del neto, o sea **$${embA.toLocaleString('es-AR')}/mes**, dejándote **$${postA.toLocaleString('es-AR')}**. El juez fija el monto exacto según las necesidades del alimentado.`,
        tone: 'warn' as const,
        icon: '👨‍👧',
      },
      _chart: {
        type: 'doughnut',
        slices: [
          { label: 'Te queda', value: postA },
          { label: 'Embargable (alimentos)', value: embA },
        ],
        prefix: '$',
        centerValue: `$${Math.round(neto).toLocaleString('es-AR')}`,
        centerLabel: 'Sueldo neto',
        ariaLabel: `De $${Math.round(neto).toLocaleString('es-AR')} de sueldo neto, hasta $${embA.toLocaleString('es-AR')} son embargables por alimentos y $${postA.toLocaleString('es-AR')} te quedan.`,
      },
    };
  }

  // Deuda común
  if (neto <= smvm) {
    return {
      montoEmbargable: 0,
      porcentajeAplicado: '0% — sueldo inembargable',
      sueldoPostEmbargo: Math.round(neto),
      detalle: `Tu sueldo neto ($${Math.round(neto).toLocaleString('es-AR')}) no supera el SMVM ($${Math.round(smvm).toLocaleString('es-AR')}), por lo que es inembargable para deudas comunes (LCT Art. 120).`,
      _insight: {
        title: 'Sueldo inembargable',
        text: `Tu neto (**$${Math.round(neto).toLocaleString('es-AR')}**) no supera 1 SMVM (**$${Math.round(smvm).toLocaleString('es-AR')}**), así que para una deuda común es **inembargable**: no te pueden retener nada (LCT Art. 120).`,
        tone: 'good' as const,
        icon: '🛡️',
      },
    };
  }

  const excedente = neto - smvm;
  let porcentaje: number;
  let porcentajeStr: string;

  if (neto <= smvm * 2) {
    porcentaje = 0.10;
    porcentajeStr = '10% del excedente sobre SMVM (sueldo entre 1 y 2 SMVM)';
  } else {
    porcentaje = 0.20;
    porcentajeStr = '20% del excedente sobre SMVM (sueldo > 2 SMVM)';
  }

  const embargable = excedente * porcentaje;
  const postEmbargo = neto - embargable;
  const embC = Math.round(embargable);
  const postC = Math.round(postEmbargo);

  return {
    montoEmbargable: embC,
    porcentajeAplicado: porcentajeStr,
    sueldoPostEmbargo: postC,
    detalle: `Sueldo neto: $${Math.round(neto).toLocaleString('es-AR')}. SMVM (inembargable): $${Math.round(smvm).toLocaleString('es-AR')}. Excedente: $${Math.round(excedente).toLocaleString('es-AR')}. Se aplica el ${(porcentaje * 100).toFixed(0)}% sobre el excedente = $${embC.toLocaleString('es-AR')}/mes embargables. Te quedan $${postC.toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Qué te pueden retener',
      text: `El embargo cae solo sobre el excedente del SMVM (**$${Math.round(excedente).toLocaleString('es-AR')}**): el **${(porcentaje * 100).toFixed(0)}%** son **$${embC.toLocaleString('es-AR')}/mes**. Sobre tu sueldo total eso es apenas el **${((embargable / neto) * 100).toFixed(1)}%**, y te quedan **$${postC.toLocaleString('es-AR')}**.`,
      tone: 'neutral' as const,
      icon: '⚖️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Te queda', value: postC },
        { label: 'Embargable', value: embC },
      ],
      prefix: '$',
      centerValue: `$${Math.round(neto).toLocaleString('es-AR')}`,
      centerLabel: 'Sueldo neto',
      ariaLabel: `De $${Math.round(neto).toLocaleString('es-AR')} de sueldo neto, $${embC.toLocaleString('es-AR')} son embargables y $${postC.toLocaleString('es-AR')} te quedan.`,
    },
  };
}
