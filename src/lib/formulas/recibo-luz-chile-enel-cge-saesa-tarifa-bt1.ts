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
  _insight?: any;
  _chart?: any;
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

  // Insight narrativo dinámico
  const clp = (n: number) => Math.round(n).toLocaleString('es-CL');
  let _insight: any = undefined;
  if (kwh_cons > 0) {
    if (i.tiene_solar && ahorro_solar_mensual > 0) {
      _insight = {
        title: 'Tus paneles bajan la boleta',
        text: `Tu boleta base es **$${clp(total_recibo)}** por **${kwh_cons} kWh**. Con el autoconsumo solar pagás **$${clp(total_con_solar)}**, un ahorro de **$${clp(ahorro_solar_mensual)}/mes**.`,
        tone: 'good',
        icon: '☀️',
      };
    } else {
      _insight = {
        title: 'Boleta estimada',
        text: `Tu boleta estimada es **$${clp(total_recibo)}** por **${kwh_cons} kWh** ($${tarifa_promedio.toLocaleString('es-CL')}/kWh de energía). El cargo fijo aporta $${clp(cargo_fijo)} y el IVA 19% suma **$${clp(iva_19)}**.`,
        tone: 'neutral',
        icon: '💡',
      };
    }
  }

  // Gráfico: composición de la boleta (cargo fijo + energía + IVA = total)
  let _chart: any = undefined;
  if (kwh_cons > 0 && total_recibo > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Cargo fijo', value: Math.round(cargo_fijo) },
        { label: 'Energía consumida', value: Math.round(costo_energia) },
        { label: 'IVA 19%', value: Math.round(iva_19) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: '$' + clp(total_recibo),
      centerLabel: 'Total boleta',
      ariaLabel: 'Composición de la boleta de luz: cargo fijo, energía e IVA',
    };
  }

  return {
    cargo_fijo: Math.round(cargo_fijo),
    costo_energia: Math.round(costo_energia),
    subtotal_sin_iva: Math.round(subtotal_sin_iva),
    iva_19: Math.round(iva_19),
    total_recibo: Math.round(total_recibo),
    ahorro_solar_mensual: Math.round(ahorro_solar_mensual),
    total_con_solar: Math.round(total_con_solar),
    tarifa_promedio: parseFloat(tarifa_promedio.toFixed(2)),
    _insight,
    _chart
  };
}
