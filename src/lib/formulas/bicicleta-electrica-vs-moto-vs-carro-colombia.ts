export interface Inputs {
  km_diarios: number;
  dias_mes: number;
  ciudad: string;
  tipo_viaje: string;
  presupuesto_compra: number;
  incluir_seguro: boolean;
  incluir_financiacion: boolean;
  plazo_financiacion: number;
  tasa_interes: number;
}

export interface Outputs {
  tco_bicicleta_anual: number;
  tco_moto_anual: number;
  tco_carro_anual: number;
  mejor_opcion: string;
  ahorro_vs_opcion2: number;
  km_anual: number;
  costo_por_km_bicicleta: number;
  costo_por_km_moto: number;
  costo_por_km_carro: number;
  break_even_moto_vs_bici: number;
  viabilidad_bicicleta: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN, Superfinanciera, ECOPETROL
  const PRECIO_GASOLINA_POR_GAL = 10500; // pesos, ECOPETROL 2026
  const CONSUMO_MOTO_KM_POR_GAL = 45; // km/galón típico
  const CONSUMO_CARRO_KM_POR_GAL = 12; // km/galón típico
  const KWH_POR_KM_BICI = 0.006; // 0.6 kWh/100km
  const PRECIO_KWH = 3500; // pesos/kWh Bogotá 2026
  const VIDA_UTIL_BICI_ANOS = 5;
  const VIDA_UTIL_MOTO_ANOS = 6;
  const VIDA_UTIL_CARRO_ANOS = 8;

  // Precios compra 2026
  const PRECIO_BICICLETA = 4000000; // $4M promedio (rango 2-5M)
  const PRECIO_MOTO_BASE = 8000000; // $8M promedio (rango 6-15M)
  const PRECIO_CARRO_BASE = 50000000; // $50M promedio (rango 40M-80M)

  // Parqueadero mensual según ciudad (pesos)
  const parqueadero_mensual_moto: { [key: string]: number } = {
    bogota: 200000,
    medellin: 150000,
    cali: 120000,
    barranquilla: 100000,
    otra: 150000
  };

  const parqueadero_mensual_carro: { [key: string]: number } = {
    bogota: 450000,
    medellin: 300000,
    cali: 250000,
    barranquilla: 200000,
    otra: 300000
  };

  // Seguros SOAT + adicional anual (pesos) - Superfinanciera 2026
  const seguro_anual_moto: { [key: string]: number } = {
    bogota: 1200000, // SOAT ~600k + responsabilidad ~600k
    medellin: 1000000,
    cali: 950000,
    barranquilla: 900000,
    otra: 1000000
  };

  const seguro_anual_carro: { [key: string]: number } = {
    bogota: 2800000, // SOAT ~1M + todo riesgo ~1.8M
    medellin: 2300000,
    cali: 2100000,
    barranquilla: 2000000,
    otra: 2300000
  };

  // Mantenimiento anual (pesos)
  const MANTENIMIENTO_BICI = 350000;
  const MANTENIMIENTO_MOTO = 900000;
  const MANTENIMIENTO_CARRO = 2000000;

  // Impuestos y papeles anuales
  const PAPELES_MOTO = 200000;
  const IMPUESTO_CIRCULACION_CARRO = 1200000;
  const PAPELES_CARRO = 100000;
  const PEAJE_CARRO_ANUAL = 250000;

  // Cálculos base
  const km_anual = i.km_diarios * i.dias_mes * 12;
  const ciudad = i.ciudad || 'bogota';

  // Financiación si aplica
  let precio_compra_bici = PRECIO_BICICLETA;
  let precio_compra_moto = PRECIO_MOTO_BASE;
  let precio_compra_carro = PRECIO_CARRO_BASE;

  if (i.incluir_financiacion && i.plazo_financiacion > 0 && i.tasa_interes > 0) {
    // Cuota mensual = P * [r(1+r)^n] / [(1+r)^n - 1]
    const tasa_mensual = i.tasa_interes / 100 / 12;
    const n = i.plazo_financiacion;
    const factor = (tasa_mensual * Math.pow(1 + tasa_mensual, n)) / (Math.pow(1 + tasa_mensual, n) - 1);
    const cuota_moto = PRECIO_MOTO_BASE * factor;
    const cuota_carro = PRECIO_CARRO_BASE * factor;
    // Costo total en plazo
    const total_moto_financiado = cuota_moto * n;
    const total_carro_financiado = cuota_carro * n;
    // Sobrecosto por intereses amortizado a año
    const interes_anual_moto = (total_moto_financiado - PRECIO_MOTO_BASE) / (i.plazo_financiacion / 12);
    const interes_anual_carro = (total_carro_financiado - PRECIO_CARRO_BASE) / (i.plazo_financiacion / 12);
    // Ajusta precio base para TCO (suma intereses a amortización)
    precio_compra_moto = PRECIO_MOTO_BASE + interes_anual_moto;
    precio_compra_carro = PRECIO_CARRO_BASE + interes_anual_carro;
  }

  // BICICLETA ELÉCTRICA
  const amortizacion_bici = precio_compra_bici / VIDA_UTIL_BICI_ANOS;
  const energia_bici = km_anual * KWH_POR_KM_BICI * PRECIO_KWH;
  const tco_bicicleta_anual = amortizacion_bici + MANTENIMIENTO_BICI + energia_bici;

  // MOTOCICLETA
  const amortizacion_moto = precio_compra_moto / VIDA_UTIL_MOTO_ANOS;
  const parqueadero_moto = parqueadero_mensual_moto[ciudad] * 12;
  const seguro_moto = i.incluir_seguro ? seguro_anual_moto[ciudad] : 0;
  const combustible_moto = (km_anual / CONSUMO_MOTO_KM_POR_GAL) * PRECIO_GASOLINA_POR_GAL;
  const tco_moto_anual = amortizacion_moto + parqueadero_moto + seguro_moto + combustible_moto + MANTENIMIENTO_MOTO + PAPELES_MOTO;

  // AUTOMÓVIL
  const amortizacion_carro = precio_compra_carro / VIDA_UTIL_CARRO_ANOS;
  const parqueadero_carro = parqueadero_mensual_carro[ciudad] * 12;
  const seguro_carro = i.incluir_seguro ? seguro_anual_carro[ciudad] : 0;
  const combustible_carro = (km_anual / CONSUMO_CARRO_KM_POR_GAL) * PRECIO_GASOLINA_POR_GAL;
  const tco_carro_anual = amortizacion_carro + parqueadero_carro + seguro_carro + combustible_carro + MANTENIMIENTO_CARRO + IMPUESTO_CIRCULACION_CARRO + PAPELES_CARRO + PEAJE_CARRO_ANUAL;

  // Costos por km
  const costo_por_km_bicicleta = km_anual > 0 ? tco_bicicleta_anual / km_anual : 0;
  const costo_por_km_moto = km_anual > 0 ? tco_moto_anual / km_anual : 0;
  const costo_por_km_carro = km_anual > 0 ? tco_carro_anual / km_anual : 0;

  // Determina mejor opción
  let mejor_opcion = '';
  let costo_mejor = Math.min(tco_bicicleta_anual, tco_moto_anual, tco_carro_anual);
  let costo_segunda = 0;

  if (costo_mejor === tco_bicicleta_anual) {
    mejor_opcion = 'Bicicleta eléctrica';
    costo_segunda = Math.min(tco_moto_anual, tco_carro_anual);
    if (i.tipo_viaje === 'intermunicipal' || km_anual > 50000) {
      mejor_opcion = 'Motocicleta (bici no es viable para distancias largas)';
      costo_mejor = tco_moto_anual;
      costo_segunda = Math.min(tco_bicicleta_anual, tco_carro_anual);
    }
  } else if (costo_mejor === tco_moto_anual) {
    mejor_opcion = 'Motocicleta';
    costo_segunda = Math.min(tco_bicicleta_anual, tco_carro_anual);
  } else {
    mejor_opcion = 'Automóvil';
    costo_segunda = Math.min(tco_bicicleta_anual, tco_moto_anual);
  }

  const ahorro_vs_opcion2 = costo_segunda - costo_mejor;

  // Break-even moto vs bici: en qué km anuales tienen TCO igual
  // tco_bici / km = tco_moto / km => km = TCO_moto / TCO_bici * km_actual
  let break_even_moto_vs_bici = 0;
  if (km_anual > 0 && tco_bicicleta_anual !== tco_moto_anual) {
    break_even_moto_vs_bici = Math.abs((tco_moto_anual - tco_bicicleta_anual) / (costo_por_km_moto - costo_por_km_bicicleta));
  }

  // Viabilidad bicicleta
  let viabilidad_bicicleta = '✅ Muy viable: clima, distancia y ciclovías óptimas';
  if (i.tipo_viaje === 'intermunicipal' || km_anual > 40000) {
    viabilidad_bicicleta = '❌ No viable: distancias intermunicipal sin cobertura eléctrica';
  } else if (i.ciudad === 'cali' || i.ciudad === 'barranquilla') {
    viabilidad_bicicleta = '⚠️ Moderada: clima tropical con lluvia frecuente';
  } else if (km_anual > 25000) {
    viabilidad_bicicleta = '⚠️ Viable pero límite: autonomía de batería comprometida';
  }

  // Redondeo a pesos sin decimales
  return {
    tco_bicicleta_anual: Math.round(tco_bicicleta_anual),
    tco_moto_anual: Math.round(tco_moto_anual),
    tco_carro_anual: Math.round(tco_carro_anual),
    mejor_opcion,
    ahorro_vs_opcion2: Math.round(ahorro_vs_opcion2),
    km_anual: Math.round(km_anual),
    costo_por_km_bicicleta: Math.round(costo_por_km_bicicleta),
    costo_por_km_moto: Math.round(costo_por_km_moto),
    costo_por_km_carro: Math.round(costo_por_km_carro),
    break_even_moto_vs_bici: Math.round(break_even_moto_vs_bici),
    viabilidad_bicicleta
  };
}
