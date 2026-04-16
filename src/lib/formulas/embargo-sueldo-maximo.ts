/**
 * Calculadora de Máximo Embargable del Sueldo - Argentina
 * Decreto 484/87: hasta 1 SMVM inembargable, 1-2 SMVM 10%, +2 SMVM 20%
 * Excepción: cuota alimentaria puede llegar a 33%+
 */

export interface EmbargoSueldoInputs {
  sueldoNeto: number;
  smvm: number;
  tipoDeuda: string;
}

export interface EmbargoSueldoOutputs {
  maximoEmbargable: number;
  sueldoPostEmbargo: number;
  porcentajeEmbargo: string;
  detalle: string;
}

export function embargoSueldoMaximo(inputs: EmbargoSueldoInputs): EmbargoSueldoOutputs {
  const sueldoNeto = Number(inputs.sueldoNeto);
  const smvm = Number(inputs.smvm);
  const tipoDeuda = inputs.tipoDeuda || 'comun';

  if (!sueldoNeto || sueldoNeto <= 0) {
    throw new Error('Ingresá tu sueldo neto mensual');
  }
  if (!smvm || smvm <= 0) {
    throw new Error('Ingresá el SMVM vigente');
  }

  let maximoEmbargable: number;
  let detalle: string;

  if (tipoDeuda === 'alimentos') {
    // Cuota alimentaria: hasta 33% del neto sin mínimo inembargable
    maximoEmbargable = sueldoNeto * 0.33;
    detalle = 'Cuota alimentaria: hasta 33% del sueldo neto (sin mínimo inembargable)';
  } else {
    // Deuda común: escalonamiento por SMVM
    let embargable = 0;

    if (sueldoNeto <= smvm) {
      embargable = 0;
      detalle = 'Tu sueldo no supera 1 SMVM: es inembargable';
    } else if (sueldoNeto <= smvm * 2) {
      const excedente1 = sueldoNeto - smvm;
      embargable = excedente1 * 0.10;
      detalle = `Excedente de 1 SMVM: $${Math.round(excedente1).toLocaleString()} × 10%`;
    } else {
      const tramo1 = smvm; // de 1 a 2 SMVM
      const tramo2 = sueldoNeto - smvm * 2; // más de 2 SMVM
      embargable = tramo1 * 0.10 + tramo2 * 0.20;
      detalle = `Tramo 1-2 SMVM: 10% + Tramo >2 SMVM: 20%`;
    }

    maximoEmbargable = embargable;
  }

  const sueldoPostEmbargo = sueldoNeto - maximoEmbargable;
  const porcentajeEmbargo = sueldoNeto > 0
    ? `${((maximoEmbargable / sueldoNeto) * 100).toFixed(1)}%`
    : '0%';

  return {
    maximoEmbargable: Math.round(maximoEmbargable),
    sueldoPostEmbargo: Math.round(sueldoPostEmbargo),
    porcentajeEmbargo,
    detalle,
  };
}
