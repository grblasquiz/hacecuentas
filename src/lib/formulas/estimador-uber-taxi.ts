/** Estimador de costo de viaje en taxi o remis */
export interface Inputs { distanciaKm: number; tiempoEstimadoMin: number; bajadaBandera: number; precioPorKm: number; precioPorMinuto: number; }
export interface Outputs { costoEstimado: number; detalle: string; _insight?: any; _chart?: any; }

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

  const partes: { label: string; value: number }[] = [
    { label: 'Bajada de bandera', value: Number(bajada.toFixed(2)) },
    { label: 'Distancia', value: Number(costoDist.toFixed(2)) },
    { label: 'Tiempo', value: Number(costoTiempo.toFixed(2)) },
  ].filter((p) => p.value > 0);

  const mayor = [
    { n: 'la distancia', v: costoDist },
    { n: 'el tiempo de viaje', v: costoTiempo },
    { n: 'la bajada de bandera', v: bajada },
  ].sort((a, b) => b.v - a.v)[0];
  const pctMayor = total > 0 ? Math.round((mayor.v / total) * 100) : 0;

  return {
    costoEstimado: Number(total.toFixed(2)),
    detalle: `Bajada: $${fmt.format(bajada)} + Distancia: $${fmt.format(costoDist)} (${fmt.format(dist)} km × $${fmt.format(porKm)}) + Tiempo: $${fmt.format(costoTiempo)} (${fmt.format(tiempo)} min × $${fmt.format(porMin)}) = **$${fmt.format(total)}**`,
    _insight: {
      title: 'Qué pesa más en la tarifa',
      text: `El viaje sale **$${fmt.format(total)}** y lo que más empuja es **${mayor.n}** (${pctMayor}% del total). Si el tránsito se complica, el costo por minuto es lo que más se dispara.`,
      tone: 'neutral',
      icon: '🚕',
    },
    _chart: {
      type: 'doughnut',
      slices: partes,
      prefix: '$',
      centerValue: `$${fmt.format(total)}`,
      centerLabel: 'Total estimado',
      ariaLabel: `Desglose de la tarifa de $${fmt.format(total)}: bajada de bandera, distancia y tiempo`,
    },
  };
}
