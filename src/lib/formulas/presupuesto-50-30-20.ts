/** Regla 50/30/20 presupuesto personal */
export interface Inputs { ingresoNeto: number; ingresosExtra?: number; }
export interface Outputs { necesidades: number; deseos: number; ahorro: number; detalle: string; }

export function presupuesto503020(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoNeto) + (Number(i.ingresosExtra) || 0);
  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso neto mensual');

  const necesidades = ingreso * 0.5;
  const deseos = ingreso * 0.3;
  const ahorro = ingreso * 0.2;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    necesidades: Math.round(necesidades),
    deseos: Math.round(deseos),
    ahorro: Math.round(ahorro),
    detalle: `De $${fmt.format(ingreso)}: $${fmt.format(necesidades)} necesidades (alquiler, comida, servicios) + $${fmt.format(deseos)} deseos (salidas, suscripciones) + $${fmt.format(ahorro)} ahorro (fondo emergencia, inversión).`,
  };
}
