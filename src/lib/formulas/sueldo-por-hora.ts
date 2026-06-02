/**
 * Calculadora de Sueldo por Hora
 * Convierte sueldo mensual a valor hora, día y semana
 */

export interface SueldoPorHoraInputs {
  sueldoMensual: number;
  tipoSueldo: string;
  horasDiarias: number;
  diasLaborables: number;
}

export interface SueldoPorHoraOutputs {
  valorHora: number;
  valorDia: number;
  valorSemana: number;
  horasMes: number;
  _insight?: any;
}

export function sueldoPorHora(inputs: SueldoPorHoraInputs): SueldoPorHoraOutputs {
  const sueldoMensual = Number(inputs.sueldoMensual);
  const horasDiarias = Number(inputs.horasDiarias) || 8;
  const diasLaborables = Number(inputs.diasLaborables) || 22;

  if (!sueldoMensual || sueldoMensual <= 0) {
    throw new Error('Ingresá tu sueldo mensual');
  }

  const horasMes = horasDiarias * diasLaborables;
  const valorHora = sueldoMensual / horasMes;
  const valorDia = sueldoMensual / diasLaborables;
  const valorSemana = valorDia * 5;

  const insight = {
    title: 'Tu valor por hora',
    text: `Con un sueldo de **$${Math.round(sueldoMensual).toLocaleString('es-AR')}** y **${horasMes} h/mes** (${horasDiarias} h × ${diasLaborables} días), cada hora vale **$${Math.round(valorHora).toLocaleString('es-AR')}** y cada día **$${Math.round(valorDia).toLocaleString('es-AR')}**. Usá este número para cotizar horas extra o trabajos por proyecto.`,
    tone: 'neutral' as const,
    icon: '⏱️',
  };

  return {
    valorHora: Math.round(valorHora),
    valorDia: Math.round(valorDia),
    valorSemana: Math.round(valorSemana),
    horasMes,
    _insight: insight,
  };
}
