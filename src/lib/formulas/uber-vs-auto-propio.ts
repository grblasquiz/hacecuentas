/** Uber/taxi vs auto propio */
export interface Inputs { viajesMes: number; costoPromedioViaje: number; costoMensualAuto: number; }
export interface Outputs { costoUberMes: number; costoAutoMes: number; diferencia: number; recomendacion: string; }

export function uberVsAutoPropio(i: Inputs): Outputs {
  const viajes = Number(i.viajesMes);
  const costoViaje = Number(i.costoPromedioViaje);
  const costoAuto = Number(i.costoMensualAuto);
  if (viajes < 0) throw new Error('Los viajes no pueden ser negativos');
  if (!costoViaje || costoViaje <= 0) throw new Error('Ingresá el costo promedio del viaje');
  if (!costoAuto || costoAuto <= 0) throw new Error('Ingresá el costo mensual del auto');

  const costoUberMes = viajes * costoViaje;
  const diferencia = Math.abs(costoAuto - costoUberMes);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoUberMes: Math.round(costoUberMes),
    costoAutoMes: Math.round(costoAuto),
    diferencia: Math.round(diferencia),
    recomendacion: costoUberMes < costoAuto
      ? `Uber/taxi te ahorra $${fmt.format(diferencia)}/mes. Conviene moverse con apps.`
      : `El auto propio te ahorra $${fmt.format(diferencia)}/mes. Conviene tener auto.`,
  };
}
