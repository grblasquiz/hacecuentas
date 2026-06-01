export interface Inputs {
  monto_compra: number;
  broker_seleccionado: 'banchile' | 'bci' | 'scotiabank' | 'vector_capital';
  rentabilidad_esperada_pct: number;
  meses_tenencia: number;
  incluir_venta: boolean;
}

export interface Outputs {
  comision_compra: number;
  derecho_bolsa_compra: number;
  custodia_proporcional: number;
  total_compra: number;
  valor_con_rentabilidad: number;
  comision_venta: number;
  derecho_bolsa_venta: number;
  igc_impuesto: number;
  total_venta: number;
  costo_total_operacion: number;
  rentabilidad_neta_pct: number;
  comparacion_brokers: Array<{broker: string; comision_compra: number; comision_venta: number; total_operacion: number}>;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Datos brokers 2026 Chile (en %)
  // Fuente: SII, Bolsa Santiago, webs brokers
  const brokerRates: Record<string, {comision: number; custodia_anual: number}> = {
    banchile: { comision: 0.8, custodia_anual: 10000 },
    bci: { comision: 0.6, custodia_anual: 10000 },
    scotiabank: { comision: 0.75, custodia_anual: 10000 },
    vector_capital: { comision: 0.35, custodia_anual: 5000 }
  };

  const selectedBroker = brokerRates[i.broker_seleccionado];
  const brokerComision = selectedBroker.comision;
  const brokercustodia = selectedBroker.custodia_anual;

  // Derecho bolsa: 0.0045% (Bolsa Santiago 2026)
  const DERECHO_BOLSA_PCT = 0.000045;
  // IGC: 19% (SII 2026)
  const IGC_RATE = 0.19;

  // ========== COMPRA ==========
  const comision_compra = (i.monto_compra * brokerComision) / 100;
  const derecho_bolsa_compra = i.monto_compra * DERECHO_BOLSA_PCT;
  const custodia_proporcional = (brokercustodia / 12) * i.meses_tenencia;
  const total_compra = comision_compra + derecho_bolsa_compra + custodia_proporcional;

  // ========== RENTABILIDAD ==========
  const valor_con_rentabilidad = i.monto_compra * (1 + i.rentabilidad_esperada_pct / 100);

  // ========== VENTA ==========
  let comision_venta = 0;
  let derecho_bolsa_venta = 0;
  let igc_impuesto = 0;
  let total_venta = 0;

  if (i.incluir_venta) {
    comision_venta = (valor_con_rentabilidad * brokerComision) / 100;
    derecho_bolsa_venta = valor_con_rentabilidad * DERECHO_BOLSA_PCT;

    // Calcular ganancia neta para IGC
    const ganancia_bruta = valor_con_rentabilidad - i.monto_compra;
    const costos_totales_hasta_venta = total_compra + comision_venta + derecho_bolsa_venta;
    const ganancia_neta = ganancia_bruta - total_compra; // Ganancia después costos compra

    if (ganancia_neta > 0) {
      igc_impuesto = ganancia_neta * IGC_RATE;
    }

    total_venta = comision_venta + derecho_bolsa_venta + igc_impuesto;
  }

  const costo_total_operacion = total_compra + total_venta;

  // ========== RENTABILIDAD NETA ==========
  const valor_final_neto = valor_con_rentabilidad - costo_total_operacion;
  const rentabilidad_neta_pct = (valor_final_neto / i.monto_compra - 1) * 100;

  // ========== COMPARACIÓN BROKERS ==========
  const comparacion_brokers = Object.entries(brokerRates).map(([brokerName, rates]) => {
    const comp_comision_compra = (i.monto_compra * rates.comision) / 100;
    const comp_derecho_bolsa_compra = i.monto_compra * DERECHO_BOLSA_PCT;
    const comp_valor_con_renta = i.monto_compra * (1 + i.rentabilidad_esperada_pct / 100);
    const comp_comision_venta = (comp_valor_con_renta * rates.comision) / 100;
    const comp_derecho_bolsa_venta = comp_valor_con_renta * DERECHO_BOLSA_PCT;
    const comp_custodia = (rates.custodia_anual / 12) * i.meses_tenencia;
    const comp_ganancia_neta = comp_valor_con_renta - i.monto_compra - comp_comision_compra - comp_derecho_bolsa_compra;
    const comp_igc = comp_ganancia_neta > 0 ? comp_ganancia_neta * IGC_RATE : 0;

    const comp_total = comp_comision_compra + comp_derecho_bolsa_compra + comp_custodia + comp_comision_venta + comp_derecho_bolsa_venta + comp_igc;

    return {
      broker: brokerName.charAt(0).toUpperCase() + brokerName.slice(1),
      comision_compra: Math.round(comp_comision_compra * 100) / 100,
      comision_venta: Math.round((comp_comision_venta + comp_igc) * 100) / 100,
      total_operacion: Math.round(comp_total * 100) / 100
    };
  });

  const costoR = Math.round(costo_total_operacion * 100) / 100;
  const rentNetaR = Math.round(rentabilidad_neta_pct * 100) / 100;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  // Broker más barato según la comparación (mismo monto/horizonte).
  const masBarato = comparacion_brokers.reduce((a, b) => (b.total_operacion < a.total_operacion ? b : a));
  const ahorroVsBarato = Math.round((costoR - masBarato.total_operacion) * 100) / 100;
  const costoPctMonto = i.monto_compra > 0 ? (costoR / i.monto_compra) * 100 : 0;

  // Tono dinámico: pérdida o costos que se comen buena parte de la ganancia bruta.
  const gananciaBruta = valor_con_rentabilidad - i.monto_compra;
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (rentNetaR < 0) tone = 'warn';
  else if (gananciaBruta > 0 && costoR / gananciaBruta > 0.4) tone = 'warn';
  else if (rentNetaR > 0) tone = 'good';

  let cierre: string;
  if (rentNetaR < 0) {
    cierre = `Con esa rentabilidad esperada terminás en rojo: **${rentNetaR}%** neto después de costos e impuesto.`;
  } else {
    cierre = `Tu rentabilidad neta real queda en **${rentNetaR}%** después de costos.`;
  }
  const tipBroker = ahorroVsBarato > 1
    ? ` Con ${masBarato.broker} ahorrarías ~**${fmt(ahorroVsBarato)}** en costos.`
    : '';

  const _insight = {
    title: 'Lo que te cuesta operar',
    text: `Entre comisiones, derecho de bolsa, custodia e IGC pagás **${fmt(costoR)}** (≈**${costoPctMonto.toFixed(2)}%** del monto). ${cierre}${tipBroker}`,
    tone,
    icon: '📉',
  };

  // Donut: el costo total se descompone en sus componentes (suman costo_total_operacion).
  const slicesRaw = [
    { label: 'Comisión compra', value: comision_compra },
    { label: 'Comisión venta', value: comision_venta },
    { label: 'IGC (impuesto)', value: igc_impuesto },
    { label: 'Custodia', value: custodia_proporcional },
    { label: 'Derecho de bolsa', value: derecho_bolsa_compra + derecho_bolsa_venta },
  ];
  const slices = slicesRaw
    .filter(s => s.value > 0)
    .map(s => ({ label: s.label, value: Math.round(s.value * 100) / 100 }));

  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmt(costoR),
    centerLabel: 'Costo total',
    ariaLabel: `Desglose del costo total de operación de ${fmt(costoR)}: comisiones, custodia, derecho de bolsa e impuesto IGC`,
  } : undefined;

  return {
    comision_compra: Math.round(comision_compra * 100) / 100,
    derecho_bolsa_compra: Math.round(derecho_bolsa_compra * 100) / 100,
    custodia_proporcional: Math.round(custodia_proporcional * 100) / 100,
    total_compra: Math.round(total_compra * 100) / 100,
    valor_con_rentabilidad: Math.round(valor_con_rentabilidad * 100) / 100,
    comision_venta: Math.round(comision_venta * 100) / 100,
    derecho_bolsa_venta: Math.round(derecho_bolsa_venta * 100) / 100,
    igc_impuesto: Math.round(igc_impuesto * 100) / 100,
    total_venta: Math.round(total_venta * 100) / 100,
    costo_total_operacion: costoR,
    rentabilidad_neta_pct: rentNetaR,
    comparacion_brokers,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
