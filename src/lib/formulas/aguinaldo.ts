/**
 * Calculadora de Aguinaldo (SAC - Sueldo Anual Complementario) Argentina
 * LCT art. 121: SAC = 50% de la mejor remuneración mensual del semestre
 * Se paga en dos cuotas: 30 de junio y 18 de diciembre
 */

export interface AguinaldoInputs {
  mejorSueldo: number;
  mesesTrabajados: number;
}

export interface AguinaldoOutputs {
  aguinaldoBruto: number;
  aguinaldoNeto: number;
  descuentos: number;
  proporcion: string;
}

export function aguinaldo(inputs: AguinaldoInputs): AguinaldoOutputs {
  const mejorSueldo = Number(inputs.mejorSueldo);
  const mesesTrabajados = Math.min(6, Math.max(0, Number(inputs.mesesTrabajados)));

  if (!mejorSueldo || mejorSueldo <= 0) {
    throw new Error('Ingresá la mejor remuneración del semestre');
  }
  if (!mesesTrabajados) {
    throw new Error('Ingresá los meses trabajados en el semestre');
  }

  // SAC proporcional: mejor_sueldo × (meses_trabajados / 12) -> según LCT art 122
  // Simplificación común: (mejor sueldo / 2) × (meses / 6)
  const aguinaldoBruto = (mejorSueldo / 2) * (mesesTrabajados / 6);

  // Descuentos sobre aguinaldo: 17% aportes (mismos que sueldo)
  const descuentos = aguinaldoBruto * 0.17;
  const aguinaldoNeto = aguinaldoBruto - descuentos;

  return {
    aguinaldoBruto: Math.round(aguinaldoBruto),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    descuentos: Math.round(descuentos),
    proporcion: `${mesesTrabajados}/6 meses trabajados`,
  };
}
