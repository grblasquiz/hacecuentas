/**
 * Calculadora de presupuesto de viaje
 * Estima presupuesto total sumando items clave, dividido por día
 */

export interface ViajePresupuestoInputs {
  dias: number;
  personas: number;
  alojamientoPorNoche: number;
  comidaPorDia: number;
  transportePorDia: number;
  actividadesPorDia: number;
  extraFijo: number; // pasajes, seguro, etc
}

export interface ViajePresupuestoOutputs {
  presupuestoTotal: number;
  porPersona: number;
  porDia: number;
  noches: number;
  alojamientoTotal: number;
  comidaTotal: number;
  transporteTotal: number;
  actividadesTotal: number;
}

export function viajePresupuesto(inputs: ViajePresupuestoInputs): ViajePresupuestoOutputs {
  const dias = Number(inputs.dias);
  const personas = Math.max(1, Number(inputs.personas) || 1);
  const aloj = Number(inputs.alojamientoPorNoche) || 0;
  const comida = Number(inputs.comidaPorDia) || 0;
  const transp = Number(inputs.transportePorDia) || 0;
  const activ = Number(inputs.actividadesPorDia) || 0;
  const extra = Number(inputs.extraFijo) || 0;

  if (!dias || dias <= 0) throw new Error('Ingresá los días del viaje');

  const noches = Math.max(0, dias - 1);
  const alojamientoTotal = aloj * noches;
  const comidaTotal = comida * dias * personas;
  const transporteTotal = transp * dias;
  const actividadesTotal = activ * dias * personas;

  const presupuestoTotal =
    alojamientoTotal + comidaTotal + transporteTotal + actividadesTotal + extra;
  const porPersona = presupuestoTotal / personas;
  const porDia = presupuestoTotal / dias;

  return {
    presupuestoTotal: Math.round(presupuestoTotal),
    porPersona: Math.round(porPersona),
    porDia: Math.round(porDia),
    noches,
    alojamientoTotal: Math.round(alojamientoTotal),
    comidaTotal: Math.round(comidaTotal),
    transporteTotal: Math.round(transporteTotal),
    actividadesTotal: Math.round(actividadesTotal),
  };
}
