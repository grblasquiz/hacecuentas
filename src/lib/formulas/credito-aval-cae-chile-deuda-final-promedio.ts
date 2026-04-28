export interface Inputs {
  carrera_tipo: 'ingeniera' | 'ciencias' | 'medicina' | 'derecho' | 'administracion' | 'educacion' | 'artes' | 'otra';
  duracion_anos: number;
  arancel_anual: number;
  incremento_anual: number;
  tasa_cae_anual: number;
  renta_inicial_egreso: number;
  crecimiento_renta: number;
  incluir_condonacion: boolean;
}

export interface Outputs {
  deuda_nominal_acumulada: number;
  deuda_con_capitalizacion: number;
  cuota_maxima_inicial: number;
  anos_pago_estimados: number;
  cuota_promedio_mensual: number;
  interes_total_pagado: number;
  deuda_condonable_20anos: number;
  descuento_condonacion: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validación
  const duracion = Math.max(2, Math.min(7, i.duracion_anos || 5));
  const arancel_base = Math.max(1500000, i.arancel_anual || 8500000);
  const incremento_pct = Math.max(0, Math.min(10, i.incremento_anual || 3)) / 100;
  const tasa_cae = Math.max(0, Math.min(5, i.tasa_cae_anual || 2)) / 100;
  const renta_inicial = Math.max(500000, i.renta_inicial_egreso || 2500000);
  const crecimiento_renta_pct = Math.max(0, Math.min(8, i.crecimiento_renta || 2.5)) / 100;

  // === CÁLCULO: Deuda Nominal Acumulada ===
  // Suma simple de aranceles durante los años de estudio
  let deuda_nominal = 0;
  for (let año = 0; año < duracion; año++) {
    const arancel_año = arancel_base * Math.pow(1 + incremento_pct, año);
    deuda_nominal += arancel_año;
  }

  // === CÁLCULO: Deuda con Capitalización (al momento de egreso) ===
  // Cada arancel se capitaliza desde el año de desembolso hasta fin carrera
  // Factor de capitalización: (1 + tasa)^(años_restantes)
  let deuda_capitalizada = 0;
  for (let año = 0; año < duracion; año++) {
    const arancel_año = arancel_base * Math.pow(1 + incremento_pct, año);
    const años_capitalizacion = duracion - año - 1; // años entre desembolso y egreso
    const arancel_capitalizado = arancel_año * Math.pow(1 + tasa_cae, años_capitalizacion);
    deuda_capitalizada += arancel_capitalizado;
  }

  // === CÁLCULO: Cuota Inicial Post-Egreso ===
  // Máximo 10% renta bruta mensual
  const cuota_inicial = (renta_inicial * 0.10) / 12;

  // === CÁLCULO: Años de Pago y Cuota Promedio ===
  // Simulación mes a mes: renta crece anualmente, cuota es 10% de renta/12
  // Deuda CAE NO genera interés adicional durante repago (solo los 2% acumulados en estudio)
  let saldo_deuda = deuda_capitalizada;
  let meses_pago = 0;
  let suma_cuotas = 0;
  let renta_actual = renta_inicial;
  let mes_año = 0; // mes dentro del año actual para control de crecimiento

  // Simulación hasta 300 meses (~25 años) como límite seguro
  for (let mes = 0; mes < 300 && saldo_deuda > 1; mes++) {
    // Incrementa renta cada 12 meses
    if (mes > 0 && mes % 12 === 0) {
      renta_actual = renta_actual * (1 + crecimiento_renta_pct);
    }

    // Cuota mensual = 10% renta / 12
    const cuota_mes = (renta_actual * 0.10) / 12;
    saldo_deuda -= cuota_mes;
    suma_cuotas += cuota_mes;
    meses_pago++;
  }

  const anos_pago = meses_pago / 12;
  const cuota_promedio = suma_cuotas / meses_pago;
  const interes_pagado = suma_cuotas - deuda_nominal; // Diferencia nominal; en CAE ~0 si no hay interes post-egreso

  // === CÁLCULO: Condonación Post-20 años (Escenario) ===
  // Simula 20 años de pago y ve cuánta deuda queda (potencial condonable)
  let saldo_20anos = deuda_capitalizada;
  let renta_20anos = renta_inicial;
  for (let mes = 0; mes < 20 * 12; mes++) {
    if (mes > 0 && mes % 12 === 0) {
      renta_20anos = renta_20anos * (1 + crecimiento_renta_pct);
    }
    const cuota_mes = (renta_20anos * 0.10) / 12;
    saldo_20anos -= cuota_mes;
    if (saldo_20anos <= 0) break;
  }

  const deuda_condonable = Math.max(0, saldo_20anos);
  const descuento_condonacion = i.incluir_condonacion ? deuda_condonable : 0;

  // Redondeo a enteros (pesos)
  return {
    deuda_nominal_acumulada: Math.round(deuda_nominal),
    deuda_con_capitalizacion: Math.round(deuda_capitalizada),
    cuota_maxima_inicial: Math.round(cuota_inicial),
    anos_pago_estimados: Math.round(anos_pago * 10) / 10,
    cuota_promedio_mensual: Math.round(cuota_promedio),
    interes_total_pagado: Math.round(Math.max(0, suma_cuotas - deuda_nominal)),
    deuda_condonable_20anos: Math.round(deuda_condonable),
    descuento_condonacion: Math.round(descuento_condonacion)
  };
}
