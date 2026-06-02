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
  _insight?: any;
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

  const plusRedondeado = Math.round(plusMensual);
  const plusAnualRedondeado = Math.round(plusAnual);
  const insight = {
    title: 'Cuánto suma tu antigüedad',
    text: anios <= 0
      ? `Todavía no acumulás antigüedad: el adicional arranca a partir del primer año cumplido, sumando **${porcPorAnio}% del básico** por cada año.`
      : `Con **${anios} año${anios === 1 ? '' : 's'}** sumás un **${porcentajeTotal}%** sobre el básico: **$${plusRedondeado.toLocaleString('es-AR')}** por mes y **$${plusAnualRedondeado.toLocaleString('es-AR')}** al año (12 meses + SAC).`,
    tone: 'good' as const,
    icon: '📅',
  };

  return {
    plusAntiguedad: plusRedondeado,
    porcentajeTotal: `${porcentajeTotal}%`,
    plusAnual: plusAnualRedondeado,
    _insight: insight,
  };
}
