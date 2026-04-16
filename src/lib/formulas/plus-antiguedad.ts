/**
 * Calculadora de Plus por Antigüedad
 * Adicional remunerativo por años de servicio según CCT
 */

export interface PlusAntiguedadInputs {
  sueldoBasico: number;
  aniosAntiguedad: number;
  porcentajePorAnio: number;
}

export interface PlusAntiguedadOutputs {
  plusAntiguedad: number;
  porcentajeTotal: string;
  plusAnual: number;
}

export function plusAntiguedad(inputs: PlusAntiguedadInputs): PlusAntiguedadOutputs {
  const sueldoBasico = Number(inputs.sueldoBasico);
  const anios = Math.max(0, Number(inputs.aniosAntiguedad) || 0);
  const porcPorAnio = Number(inputs.porcentajePorAnio) || 1;

  if (!sueldoBasico || sueldoBasico <= 0) {
    throw new Error('Ingresá tu sueldo básico de convenio');
  }

  const porcentajeTotal = anios * porcPorAnio;
  const plusMensual = sueldoBasico * (porcentajeTotal / 100);
  // Impacto anual: 12 meses + 1 de SAC = 13
  const plusAnual = plusMensual * 13;

  return {
    plusAntiguedad: Math.round(plusMensual),
    porcentajeTotal: `${porcentajeTotal}%`,
    plusAnual: Math.round(plusAnual),
  };
}
