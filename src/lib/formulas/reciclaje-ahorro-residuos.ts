/** Kg reciclados por mes y ahorro ambiental */
export interface Inputs { personas: number; porcentajeSeparacion: number; }
export interface Outputs { kgResiduosMes: number; kgRecicladosMes: number; kgNoRecicladosMes: number; co2EvitadoKg: number; detalle: string; }

export function reciclajeAhorroResiduos(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const porcSep = Number(i.porcentajeSeparacion);

  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');
  if (porcSep < 0 || porcSep > 100) throw new Error('El porcentaje debe estar entre 0 y 100');

  const kgPorPersonaDia = 1.15;
  const fraccionReciclable = 0.40;
  const co2PorKgReciclado = 2.5;

  const kgResiduosMes = personas * kgPorPersonaDia * 30;
  const kgReciclablesPotenciales = kgResiduosMes * fraccionReciclable;
  const kgRecicladosMes = kgReciclablesPotenciales * (porcSep / 100);
  const kgNoRecicladosMes = kgResiduosMes - kgRecicladosMes;
  const co2Evitado = kgRecicladosMes * co2PorKgReciclado;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    kgResiduosMes: Number(kgResiduosMes.toFixed(1)),
    kgRecicladosMes: Number(kgRecicladosMes.toFixed(1)),
    kgNoRecicladosMes: Number(kgNoRecicladosMes.toFixed(1)),
    co2EvitadoKg: Number(co2Evitado.toFixed(1)),
    detalle: `${fmt.format(kgResiduosMes)} kg residuos/mes × 40% reciclable × ${fmt.format(porcSep)}% separación = ${fmt.format(kgRecicladosMes)} kg reciclados. CO2 evitado: ${fmt.format(co2Evitado)} kg/mes. Al relleno: ${fmt.format(kgNoRecicladosMes)} kg/mes.`,
  };
}
