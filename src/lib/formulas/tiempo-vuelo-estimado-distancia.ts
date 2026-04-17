/**
 * Calculadora de Tiempo de Vuelo según Distancia
 */
export interface TiempoVueloEstimadoDistanciaInputs {
  distanciaKm: number;
  velocidadCrucero: number;
}
export interface TiempoVueloEstimadoDistanciaOutputs {
  horasVuelo: number;
  tiempoTotalConEscalas: string;
  clasificacion: string;
}
export function tiempoVueloEstimadoDistancia(i: TiempoVueloEstimadoDistanciaInputs): TiempoVueloEstimadoDistanciaOutputs {
  const km = Number(i.distanciaKm);
  const vel = Number(i.velocidadCrucero) || 850;
  if (!km || km <= 0) throw new Error("Ingresá distancia válida");
  const tiempoVuelo = km / vel;
  const tiempoTotal = tiempoVuelo + 0.5; // taxi y maniobras
  let cls = "Corto";
  if (tiempoVuelo >= 3 && tiempoVuelo < 7) cls = "Medio";
  else if (tiempoVuelo >= 7) cls = "Largo";
  const h = Math.floor(tiempoTotal);
  const m = Math.round((tiempoTotal - h) * 60);
  return {
    horasVuelo: Number(tiempoVuelo.toFixed(2)),
    tiempoTotalConEscalas: `${h}h ${m}min`,
    clasificacion: cls
  };
}
