/** Tiempo total de un viaje en auto sumando el manejo más las paradas. */
export interface Inputs {
  distancia_km?: number | string;
  velocidad_promedio?: number | string;
  paradas?: number | string;
  minutos_por_parada?: number | string;
  __country?: string;
}

export interface Outputs {
  tiempo_total: string;
  total_horas: number;
  tiempo_manejo: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function formatoHm(totalMin: number): string {
  const min = Math.max(0, Math.round(totalMin));
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function tiempoViajeConParadas(i: Inputs): Outputs {
  const distancia_km = Math.max(0, Number(i.distancia_km) || 0);
  const velocidad_promedio = Math.max(1, Number(i.velocidad_promedio) || 1);
  const paradas = Math.max(0, Math.floor(Number(i.paradas) || 0));
  const minutos_por_parada = Math.max(0, Number(i.minutos_por_parada) || 0);

  const horas_manejo = distancia_km / velocidad_promedio;
  const min_manejo = horas_manejo * 60;
  const min_paradas = paradas * minutos_por_parada;
  const total_min = Math.round(min_manejo + min_paradas);
  const total_horas = Math.round((total_min / 60) * 100) / 100;

  const tiempo_manejo = formatoHm(min_manejo);
  const tiempo_total = formatoHm(total_min);

  const resumen = distancia_km > 0
    ? `${distancia_km} km a ${velocidad_promedio} km/h son ${tiempo_manejo} de manejo${paradas > 0 ? ` + ${paradas} parada${paradas === 1 ? '' : 's'} de ${minutos_por_parada} min` : ''}: en total ${tiempo_total}.`
    : 'Cargá la distancia del viaje para calcular el tiempo.';

  const out: Outputs = { tiempo_total, total_horas, tiempo_manejo, resumen };

  if (distancia_km > 0) {
    out._insight = {
      title: 'Cuánto vas a tardar en total',
      text: `El viaje son **${tiempo_manejo}** de manejo puro; con **${paradas}** parada${paradas === 1 ? '' : 's'} de ${minutos_por_parada} min llegás a **${tiempo_total}** en total. Sumá siempre un margen: cargar nafta, baño, comer y algún embotellamiento estiran el tiempo real.`,
      tone: 'neutral',
      icon: '🕐',
    };
    if (min_paradas > 0) {
      out._chart = {
        type: 'doughnut',
        slices: [
          { label: 'Manejo', value: Math.round(min_manejo) },
          { label: 'Paradas', value: Math.round(min_paradas) },
        ],
        centerValue: tiempo_total,
        centerLabel: 'Tiempo total',
        ariaLabel: `${Math.round(min_manejo)} minutos de manejo y ${Math.round(min_paradas)} minutos de paradas.`,
      };
    }
  }

  return out;
}
