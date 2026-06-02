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
  _insight?: any;
  _chart?: any;
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
  const minVuelo = Math.round(tiempoVuelo * 60);
  const minTaxeo = 30; // 0.5h fijo
  const _insight = {
    title: 'Duración del vuelo',
    text: `Cubrir **${km.toLocaleString('es-AR')} km** a **${vel} km/h** son unas **${tiempoVuelo.toFixed(1)}h** en el aire (**${h}h ${m}min** sumando taxeo). Es un vuelo de distancia **${cls.toLowerCase()}**.`,
    tone: 'neutral',
    icon: '✈️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Vuelo en crucero', value: minVuelo },
      { label: 'Taxeo y maniobras', value: minTaxeo },
    ],
    centerValue: `${h}h ${m}min`,
    centerLabel: 'Total',
    ariaLabel: `Tiempo total de ${h} horas ${m} minutos: ${minVuelo} minutos en vuelo y ${minTaxeo} de taxeo`,
  };
  return {
    horasVuelo: Number(tiempoVuelo.toFixed(2)),
    tiempoTotalConEscalas: `${h}h ${m}min`,
    clasificacion: cls,
    _insight,
    _chart,
  };
}
