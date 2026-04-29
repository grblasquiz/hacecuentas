export interface Inputs {
  viajes_por_dia: number;
  tarifa_promedio_usd: number;
  comision_porcentaje: number;
  consumo_km_litro: number;
  precio_nafta_ars_litro: number;
  km_por_viaje: number;
  mantenimiento_diario_usd: number;
  tasa_cambio_usd_ars: number;
  horas_trabajo_dia: number;
  dias_trabajo_mes: number;
  aportacion_monotributo_porcentaje: number;
}

export interface Outputs {
  ingreso_bruto_diario_usd: number;
  comision_uber_diaria_usd: number;
  costo_combustible_diario_usd: number;
  costo_mantenimiento_diario_usd: number;
  total_costos_operativos_usd: number;
  ingreso_neto_antes_monotributo_usd: number;
  aportacion_monotributo_usd: number;
  ganancia_neta_final_diaria_usd: number;
  ganancia_neta_por_hora_usd: number;
  ganancia_neta_mensual_usd: number;
  ganancia_neta_mensual_ars: number;
}

export function compute(i: Inputs): Outputs {
  const viajes_por_dia = Number(i.viajes_por_dia) || 0;
  const tarifa_promedio_usd = Number(i.tarifa_promedio_usd) || 0;
  const comision_porcentaje = Number(i.comision_porcentaje) || 25;
  const consumo_km_litro = Number(i.consumo_km_litro) || 8;
  const precio_nafta_ars_litro = Number(i.precio_nafta_ars_litro) || 1200;
  const km_por_viaje = Number(i.km_por_viaje) || 8;
  const mantenimiento_diario_usd = Number(i.mantenimiento_diario_usd) || 3;
  const tasa_cambio_usd_ars = Number(i.tasa_cambio_usd_ars) || 1000;
  const horas_trabajo_dia = Number(i.horas_trabajo_dia) || 8;
  const dias_trabajo_mes = Number(i.dias_trabajo_mes) || 22;
  const aportacion_monotributo_porcentaje = Number(i.aportacion_monotributo_porcentaje) || 21;

  // Ingreso bruto diario
  const ingreso_bruto_diario_usd = viajes_por_dia * tarifa_promedio_usd;

  // Comisión Uber
  const comision_uber_diaria_usd = ingreso_bruto_diario_usd * (comision_porcentaje / 100);

  // Costo de combustible
  const km_totales_dia = viajes_por_dia * km_por_viaje;
  const litros_consumidos_dia = km_totales_dia / consumo_km_litro;
  const costo_combustible_ars = litros_consumidos_dia * precio_nafta_ars_litro;
  const costo_combustible_diario_usd = costo_combustible_ars / tasa_cambio_usd_ars;

  // Costo mantenimiento (ya en USD)
  const costo_mantenimiento_diario_usd = mantenimiento_diario_usd;

  // Total costos operativos
  const total_costos_operativos_usd = comision_uber_diaria_usd + costo_combustible_diario_usd + costo_mantenimiento_diario_usd;

  // Ingreso neto antes monotributo
  const ingreso_neto_antes_monotributo_usd = ingreso_bruto_diario_usd - total_costos_operativos_usd;

  // Aportación monotributo (sobre ingreso bruto)
  const aportacion_monotributo_usd = ingreso_bruto_diario_usd * (aportacion_monotributo_porcentaje / 100);

  // Ganancia neta final
  const ganancia_neta_final_diaria_usd = ingreso_neto_antes_monotributo_usd - aportacion_monotributo_usd;

  // Ganancia neta por hora
  const ganancia_neta_por_hora_usd = horas_trabajo_dia > 0 ? ganancia_neta_final_diaria_usd / horas_trabajo_dia : 0;

  // Ganancia neta mensual
  const ganancia_neta_mensual_usd = ganancia_neta_final_diaria_usd * dias_trabajo_mes;
  const ganancia_neta_mensual_ars = ganancia_neta_mensual_usd * tasa_cambio_usd_ars;

  return {
    ingreso_bruto_diario_usd: Math.max(0, ingreso_bruto_diario_usd),
    comision_uber_diaria_usd: Math.max(0, comision_uber_diaria_usd),
    costo_combustible_diario_usd: Math.max(0, costo_combustible_diario_usd),
    costo_mantenimiento_diario_usd: Math.max(0, costo_mantenimiento_diario_usd),
    total_costos_operativos_usd: Math.max(0, total_costos_operativos_usd),
    ingreso_neto_antes_monotributo_usd: Math.max(0, ingreso_neto_antes_monotributo_usd),
    aportacion_monotributo_usd: Math.max(0, aportacion_monotributo_usd),
    ganancia_neta_final_diaria_usd: Math.max(0, ganancia_neta_final_diaria_usd),
    ganancia_neta_por_hora_usd: Math.max(0, ganancia_neta_por_hora_usd),
    ganancia_neta_mensual_usd: Math.max(0, ganancia_neta_mensual_usd),
    ganancia_neta_mensual_ars: Math.max(0, ganancia_neta_mensual_ars)
  };
}
