export interface Inputs {
  precio_compra_usd: number;
  cantidad_cripto: number;
  precio_venta_usd: number;
  tipo_cambio_clp: number;
  numero_operaciones_mes: number;
  exchange: string;
  dias_tenencia?: number;
  comision_exchange_pct?: number;
}

export interface Outputs {
  monto_compra_clp: number;
  monto_venta_clp: number;
  ganancia_bruta_clp: number;
  comision_total_clp: number;
  retencion_plataforma_clp: number;
  ganancia_neta_clp: number;
  impuesto_estimado_clp: number;
  clasificacion_tributaria: string;
  neto_a_recibir_clp: number;
  rentabilidad_neta_pct: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes SII Chile 2026
  const TASA_IGC_TRADER = 0.35; // Impuesto Ganancia Capital, trader habitual
  const UMBRAL_OPERACIONES_MES_TRADER = 10; // >10 ops/mes = trader
  const RETENSION_BUDA_PCT = 0.0075; // 0.75% retención Buda
  const RETENSION_ORIONX_PCT = 0.0075; // 0.75% retención Orionx
  
  // Comisiones por defecto según exchange (SII 2026)
  const comisiones_por_exchange: { [key: string]: number } = {
    "buda": 0.01, // 0.5% compra + 0.5% venta
    "orionx": 0.009, // 0.3% compra + 0.6% venta
    "binance": 0.002, // 0.1% compra + 0.1% venta
    "kraken": 0.0026, // 0.13% compra + 0.13% venta
    "otra": 0.01 // Por defecto 1%
  };
  
  // Determinar comisión
  const comision_pct = i.comision_exchange_pct !== undefined 
    ? i.comision_exchange_pct / 100 
    : comisiones_por_exchange[i.exchange] || 0.01;
  
  // 1. Cálculo montos en CLP
  const monto_compra_clp = Math.round(i.precio_compra_usd * i.cantidad_cripto * i.tipo_cambio_clp);
  const monto_venta_clp = Math.round(i.precio_venta_usd * i.cantidad_cripto * i.tipo_cambio_clp);
  
  // 2. Ganancia bruta
  const ganancia_bruta_clp = monto_venta_clp - monto_compra_clp;
  
  // 3. Comisiones totales (compra + venta)
  const comision_total_clp = Math.round((monto_compra_clp + monto_venta_clp) * comision_pct);
  
  // 4. Retención de plataforma (solo Buda/Orionx)
  let retencion_plataforma_clp = 0;
  if (i.exchange === "buda") {
    retencion_plataforma_clp = Math.round(monto_venta_clp * RETENSION_BUDA_PCT);
  } else if (i.exchange === "orionx") {
    retencion_plataforma_clp = Math.round(monto_venta_clp * RETENSION_ORIONX_PCT);
  }
  // Binance/Kraken/Otra: no retienen en CLP
  
  // 5. Ganancia neta tributable
  const ganancia_neta_clp = Math.max(0, ganancia_bruta_clp - comision_total_clp - retencion_plataforma_clp);
  
  // 6. Clasificación tributaria y cálculo impuesto
  let clasificacion_tributaria = "";
  let tasa_impuesto = 0;
  let impuesto_estimado_clp = 0;
  
  if (i.numero_operaciones_mes > UMBRAL_OPERACIONES_MES_TRADER) {
    // TRADER HABITUAL: IGC 35% (SII Circular 2023-2026)
    clasificacion_tributaria = "Trader habitual (>10 ops/mes) - IGC 35%";
    tasa_impuesto = TASA_IGC_TRADER;
    impuesto_estimado_clp = Math.round(ganancia_neta_clp * tasa_impuesto);
  } else {
    // INVERSIONISTA OCASIONAL: Impuesto Renta variable 10-27% (simplificado 15% para estimación)
    // SII: se suma al impuesto global anual, no hay tasa fija única
    clasificacion_tributaria = "Inversionista ocasional (≤10 ops/mes) - Impuesto a la Renta estimado 15%";
    tasa_impuesto = 0.15; // Estimación para inversionista medio (rango real: 10-27%)
    impuesto_estimado_clp = Math.round(ganancia_neta_clp * tasa_impuesto);
  }
  
  // 7. Neto a recibir
  // Neto = Monto Venta − Impuesto − Comisiones (retención ya descontada en venta)
  const neto_a_recibir_clp = Math.round(monto_venta_clp - impuesto_estimado_clp - comision_total_clp);
  
  // 8. Rentabilidad neta
  const rentabilidad_neta_pct = monto_compra_clp > 0 
    ? ((neto_a_recibir_clp - monto_compra_clp) / monto_compra_clp) * 100 
    : 0;
  
  return {
    monto_compra_clp,
    monto_venta_clp,
    ganancia_bruta_clp,
    comision_total_clp,
    retencion_plataforma_clp,
    ganancia_neta_clp,
    impuesto_estimado_clp,
    clasificacion_tributaria,
    neto_a_recibir_clp,
    rentabilidad_neta_pct: Math.round(rentabilidad_neta_pct * 100) / 100
  };
}
