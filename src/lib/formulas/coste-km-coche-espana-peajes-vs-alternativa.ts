export interface Inputs {
  km_anuales: number;
  consumo_l_100km: number;
  precio_combustible: number;
  precio_peaje_ruta: number;
  km_peaje: number;
  km_alternativa: number;
  tiempo_peaje_min: number;
  tiempo_alternativa_min: number;
  precio_coche_euros: number;
  anos_amortizacion: number;
  mantenimiento_anual_euros: number;
  seguro_anual_euros: number;
  impuesto_circulacion_anual: number;
  valor_residual_percent: number;
  coste_tiempo_horario: number;
}

export interface Outputs {
  coste_combustible_km: number;
  coste_mantenimiento_km: number;
  coste_amortizacion_km: number;
  coste_fijos_km: number;
  coste_total_km: number;
  coste_anual_total: number;
  coste_ruta_peaje_total: number;
  coste_ruta_alternativa_total: number;
  diferencia_coste: number;
  tiempo_ahorro_min: number;
  coste_tiempo_ahorrado: number;
  rentabilidad_peaje: string;
  km_break_even: number;
  comparativa_aeat_baremo: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 España
  const BAREMO_AEAT_KM = 0.19; // €/km (AEAT 2026 desplazamientos laborales)
  
  // ==================== DESGLOSE COSTES POR KM ====================
  
  // 1. Coste combustible por km
  const coste_combustible_km = (i.consumo_l_100km * i.precio_combustible) / 100;
  
  // 2. Coste mantenimiento por km (incluye revisiones, neumáticos, ITV, reparaciones)
  const coste_mantenimiento_km = i.mantenimiento_anual_euros / i.km_anuales;
  
  // 3. Coste amortización por km
  // Amortización = (Precio inicial - Valor residual) / (km anuales × años amortización)
  const valor_residual = i.precio_coche_euros * (i.valor_residual_percent / 100);
  const depreciacion_total = i.precio_coche_euros - valor_residual;
  const km_totales_vida = i.km_anuales * i.anos_amortizacion;
  const coste_amortizacion_km = km_totales_vida > 0 ? depreciacion_total / km_totales_vida : 0;
  
  // 4. Coste fijos por km (seguro + impuesto circulación)
  const coste_fijos_km = (i.seguro_anual_euros + i.impuesto_circulacion_anual) / i.km_anuales;
  
  // 5. Coste total por km
  const coste_total_km = coste_combustible_km + coste_mantenimiento_km + coste_amortizacion_km + coste_fijos_km;
  
  // 6. Coste anual total
  const coste_anual_total = coste_total_km * i.km_anuales;
  
  // ==================== ANÁLISIS RUTA PEAJE VS ALTERNATIVA ====================
  
  // Costes diferenciales por km (sin costes fijos que no varían)
  const coste_variable_km = coste_combustible_km + coste_mantenimiento_km + coste_amortizacion_km;
  
  // Coste ruta con peaje
  // = peaje + combustible + mantenimiento/amortización por km
  const coste_combustible_peaje = i.km_peaje * coste_combustible_km;
  const coste_variable_peaje = i.km_peaje * coste_variable_km;
  const coste_ruta_peaje_total = i.precio_peaje_ruta + coste_combustible_peaje + coste_variable_peaje;
  
  // Coste ruta alternativa (sin peaje)
  const coste_combustible_alt = i.km_alternativa * coste_combustible_km;
  const coste_variable_alt = i.km_alternativa * coste_variable_km;
  const coste_ruta_alternativa_total = coste_combustible_alt + coste_variable_alt; // sin peaje
  
  // Diferencia de coste (positivo = peaje más caro)
  const diferencia_coste = coste_ruta_peaje_total - coste_ruta_alternativa_total;
  
  // Tiempo ahorrado (en minutos)
  const tiempo_ahorro_min = i.tiempo_alternativa_min - i.tiempo_peaje_min;
  
  // Valor económico del tiempo ahorrado (en horas)
  const horas_ahorradas = tiempo_ahorro_min / 60;
  const coste_tiempo_ahorrado = horas_ahorradas * i.coste_tiempo_horario;
  
  // ==================== ANÁLISIS RENTABILIDAD ====================
  
  // Recomendación: compensa peaje si ahorro de tiempo > coste extra + margen prudencia (factor 0.3)
  let rentabilidad_peaje: string;
  
  if (diferencia_coste <= 0) {
    // Peaje es más barato en coste puro
    rentabilidad_peaje = "✓ SÍ compensa. Ahorras dinero + tiempo con peaje.";
  } else if (coste_tiempo_ahorrado > diferencia_coste * 1.3) {
    // Ahorro tiempo cubre coste extra + 30% margen
    rentabilidad_peaje = "✓ SÍ compensa. Ahorro de tiempo justifica coste peaje.";
  } else if (coste_tiempo_ahorrado > diferencia_coste) {
    // Ahorro tiempo cubre coste extra sin margen
    rentabilidad_peaje = "~ MARGINAL. Depende frecuencia viaje y tu valoración tiempo.";
  } else {
    // No compensa
    rentabilidad_peaje = "✗ NO compensa. Coste peaje > ahorro tiempo. Mejor ruta gratuita.";
  }
  
  // ==================== BREAK-EVEN ANUAL ====================
  
  // Cuántos km/año necesitas para que peaje sea rentable
  // Lógica: si usas esta ruta N veces/año (ida = 1 viaje):
  // coste_anual_peaje = precio_peaje × N
  // diferencia_km_coste = (km_alternativa - km_peaje) × coste_variable_km × N
  // break-even: precio_peaje × N = diferencia_km_coste × N
  // => precio_peaje = (km_alternativa - km_peaje) × coste_variable_km
  
  const km_extra_alternativa = i.km_alternativa - i.km_peaje;
  let km_break_even = 0;
  
  if (km_extra_alternativa > 0) {
    // Número de viajes/año para break-even
    // N × precio_peaje = N × km_extra × coste_variable_km
    // N = precio_peaje / (km_extra × coste_variable_km)
    const viajes_break_even = i.precio_peaje_ruta / (km_extra_alternativa * coste_variable_km);
    km_break_even = Math.ceil(viajes_break_even * i.km_peaje); // km/año recorridos en ruta peaje
  }
  
  // ==================== COMPARATIVA CON BAREMO AEAT ====================
  
  // Diferencia respecto baremo oficial (si es para gastos deducibles)
  const comparativa_aeat_baremo = coste_total_km - BAREMO_AEAT_KM;
  
  return {
    coste_combustible_km: Math.round(coste_combustible_km * 1000) / 1000,
    coste_mantenimiento_km: Math.round(coste_mantenimiento_km * 1000) / 1000,
    coste_amortizacion_km: Math.round(coste_amortizacion_km * 1000) / 1000,
    coste_fijos_km: Math.round(coste_fijos_km * 1000) / 1000,
    coste_total_km: Math.round(coste_total_km * 1000) / 1000,
    coste_anual_total: Math.round(coste_anual_total * 100) / 100,
    coste_ruta_peaje_total: Math.round(coste_ruta_peaje_total * 100) / 100,
    coste_ruta_alternativa_total: Math.round(coste_ruta_alternativa_total * 100) / 100,
    diferencia_coste: Math.round(diferencia_coste * 100) / 100,
    tiempo_ahorro_min: Math.round(tiempo_ahorro_min),
    coste_tiempo_ahorrado: Math.round(coste_tiempo_ahorrado * 100) / 100,
    rentabilidad_peaje: rentabilidad_peaje,
    km_break_even: Math.max(0, km_break_even),
    comparativa_aeat_baremo: Math.round(comparativa_aeat_baremo * 1000) / 1000
  };
}
