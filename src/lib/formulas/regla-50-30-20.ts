/** Presupuesto personal con la regla 50/30/20 */

export interface Inputs {
  ingresoMensual: number;
}

export interface Outputs {
  necesidades: number;
  deseos: number;
  ahorro: number;
  detalle: string;
}

export function regla503020(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoMensual);
  if (isNaN(ingreso) || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual neto');

  const necesidades = ingreso * 0.50;
  const deseos = ingreso * 0.30;
  const ahorro = ingreso * 0.20;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Necesidades (50%): $${fmt.format(necesidades)} — alquiler, servicios, comida, transporte, salud. ` +
    `Deseos (30%): $${fmt.format(deseos)} — salidas, suscripciones, hobbies, ropa. ` +
    `Ahorro (20%): $${fmt.format(ahorro)} — fondo de emergencia, inversiones, metas.`;

  return {
    necesidades: Math.round(necesidades),
    deseos: Math.round(deseos),
    ahorro: Math.round(ahorro),
    detalle,
  };
}
