/** Ingreso generado por hora de trabajo */

export interface Inputs {
  ingresoMensual: number;
  horasTrabajadasMes: number;
}

export interface Outputs {
  ingresoPorHora: number;
  ingresoPorDia: number;
  detalle: string;
}

export function productividadHora(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoMensual);
  const horas = Number(i.horasTrabajadasMes);

  if (isNaN(ingreso) || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');
  if (isNaN(horas) || horas < 1) throw new Error('Las horas trabajadas deben ser al menos 1');

  const ingresoPorHora = ingreso / horas;
  const ingresoPorDia = ingresoPorHora * 8;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Con un ingreso de $${fmt.format(ingreso)}/mes y ${horas} horas de trabajo, ` +
    `generás $${fmt.format(ingresoPorHora)} por hora y $${fmt.format(ingresoPorDia)} por día (jornada de 8hs). ` +
    `Cualquier tarea que puedas delegar por menos de $${fmt.format(ingresoPorHora)}/hora, te conviene tercerizarla.`;

  return {
    ingresoPorHora: Math.round(ingresoPorHora),
    ingresoPorDia: Math.round(ingresoPorDia),
    detalle,
  };
}
