/** Estimador de costo de viaje en taxi o remis */
export interface Inputs { distanciaKm: number; tiempoEstimadoMin: number; bajadaBandera: number; precioPorKm: number; precioPorMinuto: number; }
export interface Outputs { costoEstimado: number; detalle: string; }

export function estimadorUberTaxi(i: Inputs): Outputs {
  const dist = Number(i.distanciaKm);
  const tiempo = Number(i.tiempoEstimadoMin);
  const bajada = Number(i.bajadaBandera);
  const porKm = Number(i.precioPorKm);
  const porMin = Number(i.precioPorMinuto);

  if (!dist || dist <= 0) throw new Error('Ingresá la distancia del viaje');
  if (!tiempo || tiempo <= 0) throw new Error('Ingresá el tiempo estimado');
  if (isNaN(bajada) || bajada < 0) throw new Error('Ingresá la bajada de bandera');
  if (isNaN(porKm) || porKm < 0) throw new Error('Ingresá el precio por km');
  if (isNaN(porMin) || porMin < 0) throw new Error('Ingresá el precio por minuto');

  const costoDist = dist * porKm;
  const costoTiempo = tiempo * porMin;
  const total = bajada + costoDist + costoTiempo;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    costoEstimado: Number(total.toFixed(2)),
    detalle: `Bajada: $${fmt.format(bajada)} + Distancia: $${fmt.format(costoDist)} (${fmt.format(dist)} km × $${fmt.format(porKm)}) + Tiempo: $${fmt.format(costoTiempo)} (${fmt.format(tiempo)} min × $${fmt.format(porMin)}) = **$${fmt.format(total)}**`,
  };
}
