export interface Inputs {
  opcion_tarifa: 'bt1' | 'bt2' | 'bt3';
  consumo_kwh_mes: number;
  potencia_contratada_kw: number;
  distribuidor: 'enel' | 'chilectra' | 'saesa' | 'cooperativa' | 'otra';
  mes_comparacion: 'verano' | 'invierno' | 'promedio';
}

export interface Outputs {
  cargo_fijo_bt: number;
  cargo_energia: number;
  cargo_potencia: number;
  subtotal_sin_impuestos: number;
  impuesto_electricidad_pct: number;
  total_con_impuestos: number;
  costo_kwh_promedio: number;
  opcion_mas_conveniente: string;
  ahorro_mensual_vs_actual: number;
  plazo_recuperacion_cambio: number;
}

export function compute(i: Inputs): Outputs {
  // Tarifas 2026 Chile (promedios SII, pueden variar ±5-10% por distribuidora)
  // Fuente: SII, Distribuidoras RM/Regional
  
  const tarif_bt1 = {
    cargo_fijo: 3200, // $ CLP/mes (Enel RM ~3100, Chilectra ~3300)
    tarifa_energia: 205, // $/kWh (rango 200-220)
    tarifa_potencia: 0 // incluida en energía
  };
  
  const tarif_bt2 = {
    cargo_fijo: 1500, // $/mes
    tarifa_energia: 190, // $/kWh
    tarifa_potencia: 5500 // $/kW/mes (rango 5000-6500)
  };
  
  const tarif_bt3 = {
    cargo_fijo: 1100, // $/mes
    tarifa_energia: 185, // $/kWh
    tarifa_potencia: 4500 // $/kW/mes (rango 4000-5200)
  };
  
  // Ajuste por distribuidora (factor multiplicador)
  const factor_dist = i.distribuidor === 'enel' ? 0.98
    : i.distribuidor === 'chilectra' ? 1.02
    : i.distribuidor === 'saesa' ? 0.95
    : i.distribuidor === 'cooperativa' ? 0.90
    : 1.0; // 'otra'
  
  // Ajuste potencia según mes (demanda máxima estimada para BT3)
  let potencia_demanda = i.potencia_contratada_kw;
  if (i.mes_comparacion === 'invierno') {
    potencia_demanda *= 1.15; // 15% más demanda en invierno
  } else if (i.mes_comparacion === 'verano') {
    potencia_demanda *= 1.10; // 10% más en verano
  }
  // promedio: sin ajuste
  
  // Impuesto electricidad (promedio nacional 2.3%, rango 2-3% según comuna)
  const impuesto_pct = 2.3;
  
  // Cálculos por opción
  let cargo_fijo = 0, cargo_energia = 0, cargo_potencia = 0;
  
  if (i.opcion_tarifa === 'bt1') {
    cargo_fijo = tarif_bt1.cargo_fijo * factor_dist;
    cargo_energia = i.consumo_kwh_mes * tarif_bt1.tarifa_energia * factor_dist;
    cargo_potencia = 0;
  } else if (i.opcion_tarifa === 'bt2') {
    cargo_fijo = tarif_bt2.cargo_fijo * factor_dist;
    cargo_energia = i.consumo_kwh_mes * tarif_bt2.tarifa_energia * factor_dist;
    cargo_potencia = i.potencia_contratada_kw * tarif_bt2.tarifa_potencia * factor_dist;
  } else if (i.opcion_tarifa === 'bt3') {
    cargo_fijo = tarif_bt3.cargo_fijo * factor_dist;
    cargo_energia = i.consumo_kwh_mes * tarif_bt3.tarifa_energia * factor_dist;
    cargo_potencia = potencia_demanda * tarif_bt3.tarifa_potencia * factor_dist;
  }
  
  const subtotal_sin_impuestos = cargo_fijo + cargo_energia + cargo_potencia;
  const monto_impuesto = subtotal_sin_impuestos * (impuesto_pct / 100);
  const total_con_impuestos = subtotal_sin_impuestos + monto_impuesto;
  
  const costo_kwh_promedio = i.consumo_kwh_mes > 0 
    ? total_con_impuestos / i.consumo_kwh_mes 
    : 0;
  
  // Cálculo comparativo para opción más conveniente
  // Estimar costos en las 3 opciones
  const costos_opciones: { [key: string]: number } = {};
  
  // BT1
  const costo_bt1 = (tarif_bt1.cargo_fijo + i.consumo_kwh_mes * tarif_bt1.tarifa_energia) * factor_dist;
  costos_opciones['bt1'] = costo_bt1 * (1 + impuesto_pct / 100);
  
  // BT2
  const costo_bt2 = (tarif_bt2.cargo_fijo + i.consumo_kwh_mes * tarif_bt2.tarifa_energia 
    + i.potencia_contratada_kw * tarif_bt2.tarifa_potencia) * factor_dist;
  costos_opciones['bt2'] = costo_bt2 * (1 + impuesto_pct / 100);
  
  // BT3
  const costo_bt3 = (tarif_bt3.cargo_fijo + i.consumo_kwh_mes * tarif_bt3.tarifa_energia 
    + potencia_demanda * tarif_bt3.tarifa_potencia) * factor_dist;
  costos_opciones['bt3'] = costo_bt3 * (1 + impuesto_pct / 100);
  
  // Opción más conveniente (costo mínimo)
  const opcion_mas_conveniente = Object.keys(costos_opciones).reduce((a, b) => 
    costos_opciones[a] < costos_opciones[b] ? a : b
  );
  
  // Ahorro vs. opción actual (supuesto: usuario está en BT1, calcular diferencia)
  // Si selecciona BT2/BT3, mostrar costo adicional/ahorro
  const costo_actual = costos_opciones[i.opcion_tarifa] || total_con_impuestos;
  const costo_bt1_ref = costos_opciones['bt1'] || total_con_impuestos;
  const ahorro_vs_bt1 = costo_bt1_ref - costo_actual;
  
  // Plazo recuperación: si hay costo de cambio (~$100k) dividir por ahorro mensual
  // Supuesto: cambio cuesta $100,000 (medidor nuevo)
  const costo_cambio_medidor = 100000;
  let plazo = 0;
  if (ahorro_vs_bt1 > 0 && ahorro_vs_bt1 < 500) {
    plazo = costo_cambio_medidor / ahorro_vs_bt1; // meses
  } else if (ahorro_vs_bt1 <= 0) {
    plazo = 999; // no rentable
  }
  
  return {
    cargo_fijo_bt: Math.round(cargo_fijo),
    cargo_energia: Math.round(cargo_energia),
    cargo_potencia: Math.round(cargo_potencia),
    subtotal_sin_impuestos: Math.round(subtotal_sin_impuestos),
    impuesto_electricidad_pct: impuesto_pct,
    total_con_impuestos: Math.round(total_con_impuestos),
    costo_kwh_promedio: Math.round(costo_kwh_promedio),
    opcion_mas_conveniente: opcion_mas_conveniente.toUpperCase(),
    ahorro_mensual_vs_actual: Math.round(ahorro_vs_bt1),
    plazo_recuperacion_cambio: plazo > 100 ? 999 : Math.round(plazo * 10) / 10
  };
}
