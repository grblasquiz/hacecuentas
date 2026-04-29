export interface Inputs {
  city: string;
  distance_km: number;
  time_slot: string;
  waiting_minutes: number;
  include_tip: boolean;
}

export interface Outputs {
  bandera: number;
  tarifa_km: number;
  costo_distancia: number;
  costo_espera: number;
  subtotal: number;
  total_fare: number;
  propina_sugerida: number;
  total_con_propina: number;
  precio_promedio_km: number;
}

const CITY_RATES_2026: Record<string, {bandera: number, tarifa_km: number, espera_5min: number}> = {
  caba: { bandera: 850, tarifa_km: 95, espera_5min: 100 },
  cordoba: { bandera: 420, tarifa_km: 46, espera_5min: 50 },
  rosario: { bandera: 380, tarifa_km: 41, espera_5min: 45 },
  mendoza: { bandera: 350, tarifa_km: 38, espera_5min: 40 },
  la_plata: { bandera: 400, tarifa_km: 44, espera_5min: 45 }
};

const MINIMO_GARANTIZADO: Record<string, number> = {
  caba: 500,
  cordoba: 250,
  rosario: 230,
  mendoza: 220,
  la_plata: 240
};

export function compute(i: Inputs): Outputs {
  const city = i.city || 'caba';
  const distance_km = Math.max(0, Number(i.distance_km) || 0);
  const time_slot = i.time_slot || 'day';
  const waiting_minutes = Math.max(0, Number(i.waiting_minutes) || 0);
  const include_tip = Boolean(i.include_tip);

  if (!CITY_RATES_2026[city]) {
    return {
      bandera: 0,
      tarifa_km: 0,
      costo_distancia: 0,
      costo_espera: 0,
      subtotal: 0,
      total_fare: 0,
      propina_sugerida: 0,
      total_con_propina: 0,
      precio_promedio_km: 0
    };
  }

  const rates = CITY_RATES_2026[city];
  const minimo = MINIMO_GARANTIZADO[city];

  // Cálculo de componentes
  const bandera = rates.bandera;
  const tarifa_km = rates.tarifa_km;
  const costo_distancia = distance_km > 0 ? distance_km * tarifa_km : 0;
  
  // Costo de espera: cada 5 minutos
  const bloques_espera = Math.ceil(waiting_minutes / 5);
  const costo_espera = bloques_espera > 0 ? bloques_espera * rates.espera_5min : 0;

  // Subtotal sin recargos
  let subtotal = bandera + costo_distancia + costo_espera;
  
  // Aplicar mínimo garantizado
  subtotal = Math.max(subtotal, minimo);

  // Aplicar recargos según horario
  let total_fare = subtotal;
  if (time_slot === 'night') {
    total_fare = subtotal * 1.5; // Recargo nocturno 50%
  } else if (time_slot === 'feriado') {
    total_fare = subtotal * 1.25; // Recargo feriado 25%
  }

  // Redondear a centenos
  total_fare = Math.round(total_fare * 100) / 100;

  // Propina sugerida (10-15% promedio 12.5%)
  const propina_sugerida = Math.round(total_fare * 0.125 * 100) / 100;
  const total_con_propina = include_tip ? Math.round((total_fare + propina_sugerida) * 100) / 100 : total_fare;

  // Precio promedio por km
  const precio_promedio_km = distance_km > 0 ? Math.round((total_fare / distance_km) * 100) / 100 : 0;

  return {
    bandera: Math.round(bandera * 100) / 100,
    tarifa_km: Math.round(tarifa_km * 100) / 100,
    costo_distancia: Math.round(costo_distancia * 100) / 100,
    costo_espera: Math.round(costo_espera * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    total_fare: total_fare,
    propina_sugerida: propina_sugerida,
    total_con_propina: total_con_propina,
    precio_promedio_km: precio_promedio_km
  };
}
