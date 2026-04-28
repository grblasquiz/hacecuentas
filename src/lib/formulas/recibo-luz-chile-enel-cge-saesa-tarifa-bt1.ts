export interface Inputs {
  distribuidor: 'enel_santiago' | 'cge' | 'saesa' | 'conafe' | 'eechi';
  kwh_consumido: number;
  tiene_solar: boolean;
  kwh_solar_generado: number;
}

export interface Outputs {
  cargo_fijo: number;
  costo_energia: number;
  subtotal_sin_iva: number;
  iva_19: number;
  total_recibo: number;
  ahorro_solar_mensual: number;
  total_con_solar: number;
  tarifa_promedio: number;
}

export function compute(i: Inputs): Outputs {
  // Tarifas vigentes CNE 2026 (promedio trimestral abril 2026, $/kWh sin IVA)
  // Fuente: CNE - Comisión Nacional de Energía
  const TARIFAS: Record<string, { cargo_fijo: number; tarifa_kwh: number }> = {
    enel_santiago: {
      cargo_fijo: 4200,    // CFS mayo 2026 Enel Santiago (sin IVA)
      tarifa_kwh: 115      // $/kWh promedio 2026 Q2
    },
    cge: {
      cargo_fijo: 3900,    // CGE Zona Centro-Sur (sin IVA)
      tarifa_kwh: 110      // Tarifa media CGE
    },
    saesa: {
      cargo_fijo: 4100,    // Saesa Zona Sur (sin IVA)
      tarifa_kwh: 105      // Tarifa media Saesa
    },
    conafe: {
      cargo_fijo: 4400,    // Conafe Zona Norte (sin IVA)
      tarifa_kwh: 120      // Tarifa media Conafe (más cara por aislamiento)
    },
    eechi: {
      cargo_fijo: 4600,    // EEChi Patagonia (sin IVA)
      tarifa_kwh: 125      // Tarifa media Magallanes/Aysén
    }
  };

  const IVA_RATE = 0.19;  // Tasa IVA aplicable servicio eléctrico (SII 2026)

  // Validaciones y defaults
  const dist = i.distribuidor || 'enel_santiago';
  const tarifa_data = TARIFAS[dist] || TARIFAS['enel_santiago'];
  const kwh_cons = Math.max(0, i.kwh_consumido || 0);
  const kwh_solar = i.tiene_solar ? Math.max(0, i.kwh_solar_generado || 0) : 0;

  // Cálculo cargo fijo (sin IVA)
  const cargo_fijo = tarifa_data.cargo_fijo;

  // Cálculo costo energía antes de autoconsumo solar
  let kwh_facturado = kwh_cons;

  // Si tiene autoconsumo solar, reduce kWh facturado (net metering simplificado)
  if (i.tiene_solar && kwh_solar > 0) {
    kwh_facturado = Math.max(0, kwh_cons - kwh_solar);
  }

  const costo_energia = kwh_facturado * tarifa_data.tarifa_kwh;

  // Subtotal sin IVA
  const subtotal_sin_iva = cargo_fijo + costo_energia;

  // IVA 19%
  const iva_19 = subtotal_sin_iva * IVA_RATE;

  // Total recibo base
  const total_recibo = subtotal_sin_iva + iva_19;

  // Ahorro solar (kWh reducidos × tarifa × (1 + IVA))
  const ahorro_sin_iva = Math.min(kwh_solar, kwh_cons) * tarifa_data.tarifa_kwh;
  const ahorro_solar_mensual = ahorro_sin_iva * (1 + IVA_RATE);

  // Total con autoconsumo
  const total_con_solar = Math.max(0, total_recibo - ahorro_solar_mensual);

  // Tarifa promedio consumo (costo energía / kWh consumido, sin cargo fijo)
  const tarifa_promedio = kwh_cons > 0 ? costo_energia / kwh_cons : 0;

  return {
    cargo_fijo: Math.round(cargo_fijo),
    costo_energia: Math.round(costo_energia),
    subtotal_sin_iva: Math.round(subtotal_sin_iva),
    iva_19: Math.round(iva_19),
    total_recibo: Math.round(total_recibo),
    ahorro_solar_mensual: Math.round(ahorro_solar_mensual),
    total_con_solar: Math.round(total_con_solar),
    tarifa_promedio: parseFloat(tarifa_promedio.toFixed(2))
  };
}
