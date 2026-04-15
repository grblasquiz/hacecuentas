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
    return {
      montoEmbargable: Math.round(maxAlimentaria),
      porcentajeAplicado: '33% del sueldo neto (tope alimentaria)',
      sueldoPostEmbargo: Math.round(neto - maxAlimentaria),
      detalle: `Por cuota alimentaria, el tope embargable es hasta el 33% del sueldo neto: $${Math.round(maxAlimentaria).toLocaleString('es-AR')}/mes. Te quedarían $${Math.round(neto - maxAlimentaria).toLocaleString('es-AR')}. El juez define el monto exacto según las necesidades del alimentado.`,
    };
  }

  // Deuda común
  if (neto <= smvm) {
    return {
      montoEmbargable: 0,
      porcentajeAplicado: '0% — sueldo inembargable',
      sueldoPostEmbargo: Math.round(neto),
      detalle: `Tu sueldo neto ($${Math.round(neto).toLocaleString('es-AR')}) no supera el SMVM ($${Math.round(smvm).toLocaleString('es-AR')}), por lo que es inembargable para deudas comunes (LCT Art. 120).`,
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

  return {
    montoEmbargable: Math.round(embargable),
    porcentajeAplicado: porcentajeStr,
    sueldoPostEmbargo: Math.round(postEmbargo),
    detalle: `Sueldo neto: $${Math.round(neto).toLocaleString('es-AR')}. SMVM (inembargable): $${Math.round(smvm).toLocaleString('es-AR')}. Excedente: $${Math.round(excedente).toLocaleString('es-AR')}. Se aplica el ${(porcentaje * 100).toFixed(0)}% sobre el excedente = $${Math.round(embargable).toLocaleString('es-AR')}/mes embargables. Te quedan $${Math.round(postEmbargo).toLocaleString('es-AR')}.`,
  };
}
