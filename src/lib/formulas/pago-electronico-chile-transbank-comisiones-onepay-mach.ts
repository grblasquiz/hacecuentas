export interface Inputs {
  giro_comercio: 'retail' | 'gastronomia' | 'servicios' | 'turismo' | 'farmacia' | 'educacion' | 'ecommerce';
  monto_mensual_pesos: number;
  porcentaje_debito: number;
  medio_pago: 'transbank' | 'onepay' | 'mach' | 'mercadopago' | 'comparar_todas';
  incluir_interes_financiamiento: boolean;
}

export interface Outputs {
  comision_por_transaccion_debito: number;
  comision_por_transaccion_credito: number;
  monto_comision_debito_mensual: number;
  monto_comision_credito_mensual: number;
  comision_total_mensual: number;
  comision_promedio_ponderada: number;
  comision_anual_estimada: number;
  comparativa_alternativas: {
    transbank_plus: number;
    onepay: number;
    mach: number;
    mercado_pago: number;
  };
  mejor_opcion: string;
  ahorro_potencial_mensual: number;
}

export function compute(i: Inputs): Outputs {
  // Tasas base por pasarela y tipo tarjeta (2026, SII)
  // Fuente: Transbank, OnePay, Mach, Mercado Pago tarifarios 2026
  const tasas: Record<string, Record<string, { debito: number; credito: number }>> = {
    retail: {
      transbank: { debito: 0.01, credito: 0.025 },
      onepay: { debito: 0.01, credito: 0.028 },
      mach: { debito: 0.011, credito: 0.03 },
      mercadopago: { debito: 0.015, credito: 0.035 },
    },
    gastronomia: {
      transbank: { debito: 0.012, credito: 0.032 },
      onepay: { debito: 0.012, credito: 0.032 },
      mach: { debito: 0.013, credito: 0.033 },
      mercadopago: { debito: 0.02, credito: 0.04 },
    },
    servicios: {
      transbank: { debito: 0.011, credito: 0.028 },
      onepay: { debito: 0.011, credito: 0.029 },
      mach: { debito: 0.012, credito: 0.031 },
      mercadopago: { debito: 0.018, credito: 0.038 },
    },
    turismo: {
      transbank: { debito: 0.012, credito: 0.035 },
      onepay: { debito: 0.013, credito: 0.035 },
      mach: { debito: 0.014, credito: 0.036 },
      mercadopago: { debito: 0.02, credito: 0.042 },
    },
    farmacia: {
      transbank: { debito: 0.008, credito: 0.022 },
      onepay: { debito: 0.009, credito: 0.024 },
      mach: { debito: 0.01, credito: 0.026 },
      mercadopago: { debito: 0.014, credito: 0.032 },
    },
    educacion: {
      transbank: { debito: 0.009, credito: 0.024 },
      onepay: { debito: 0.01, credito: 0.026 },
      mach: { debito: 0.011, credito: 0.028 },
      mercadopago: { debito: 0.015, credito: 0.034 },
    },
    ecommerce: {
      transbank: { debito: 0.013, credito: 0.033 },
      onepay: { debito: 0.014, credito: 0.034 },
      mach: { debito: 0.015, credito: 0.035 },
      mercadopago: { debito: 0.018, credito: 0.04 },
    },
  };

  // Ajuste por financiamiento sin interés (suma ~1.5% a crédito)
  const ajuste_financiamiento = i.incluir_interes_financiamiento ? 0.015 : 0;

  // Obtener tasas para giro seleccionado
  const tasa_giro = tasas[i.giro_comercio] || tasas.retail;

  // Porcentaje de crédito
  const porcentaje_credito = 1 - i.porcentaje_debito / 100;

  // Función auxiliar: calcular comisión para una pasarela
  const calcularComisionPasarela = (
    pasarela: 'transbank' | 'onepay' | 'mach' | 'mercadopago'
  ): number => {
    const tasas_pasarela = tasa_giro[pasarela];
    const comision_debito =
      i.monto_mensual_pesos * (i.porcentaje_debito / 100) * tasas_pasarela.debito;
    const comision_credito =
      i.monto_mensual_pesos *
      porcentaje_credito *
      (tasas_pasarela.credito + ajuste_financiamiento);
    return comision_debito + comision_credito;
  };

  // Calcular para pasarela seleccionada
  const pasarela_actual = i.medio_pago === 'comparar_todas' ? 'transbank' : i.medio_pago;
  const tasas_actual = tasa_giro[pasarela_actual as keyof typeof tasa_giro];

  const monto_comision_debito_mensual =
    i.monto_mensual_pesos * (i.porcentaje_debito / 100) * tasas_actual.debito;
  const monto_comision_credito_mensual =
    i.monto_mensual_pesos *
    porcentaje_credito *
    (tasas_actual.credito + ajuste_financiamiento);
  const comision_total_mensual =
    monto_comision_debito_mensual + monto_comision_credito_mensual;
  const comision_promedio_ponderada =
    (comision_total_mensual / i.monto_mensual_pesos) * 100;
  const comision_anual_estimada = comision_total_mensual * 12;

  // Comparativa todas pasarelas
  const comparativa_transbank = calcularComisionPasarela('transbank');
  const comparativa_onepay = calcularComisionPasarela('onepay');
  const comparativa_mach = calcularComisionPasarela('mach');
  const comparativa_mercadopago = calcularComisionPasarela('mercadopago');

  // Mejor opción (menor comisión)
  const todas = {
    transbank_plus: comparativa_transbank,
    onepay: comparativa_onepay,
    mach: comparativa_mach,
    mercado_pago: comparativa_mercadopago,
  };
  const mejorOpcion = Object.entries(todas).reduce((a, b) =>
    a[1] < b[1] ? a : b
  )[0];

  const etiquetas: Record<string, string> = {
    transbank_plus: 'Transbank Plus',
    onepay: 'OnePay',
    mach: 'Mach',
    mercado_pago: 'Mercado Pago',
  };

  const ahorro_potencial_mensual = Math.max(
    ...[comparativa_transbank, comparativa_onepay, comparativa_mach, comparativa_mercadopago]
  ) - Math.min(
    ...[comparativa_transbank, comparativa_onepay, comparativa_mach, comparativa_mercadopago]
  );

  return {
    comision_por_transaccion_debito: tasas_actual.debito * 100,
    comision_por_transaccion_credito: (tasas_actual.credito + ajuste_financiamiento) * 100,
    monto_comision_debito_mensual: Math.round(monto_comision_debito_mensual),
    monto_comision_credito_mensual: Math.round(monto_comision_credito_mensual),
    comision_total_mensual: Math.round(comision_total_mensual),
    comision_promedio_ponderada: Math.round(comision_promedio_ponderada * 100) / 100,
    comision_anual_estimada: Math.round(comision_anual_estimada),
    comparativa_alternativas: {
      transbank_plus: Math.round(comparativa_transbank),
      onepay: Math.round(comparativa_onepay),
      mach: Math.round(comparativa_mach),
      mercado_pago: Math.round(comparativa_mercadopago),
    },
    mejor_opcion: etiquetas[mejorOpcion],
    ahorro_potencial_mensual: Math.round(ahorro_potencial_mensual),
  };
}
