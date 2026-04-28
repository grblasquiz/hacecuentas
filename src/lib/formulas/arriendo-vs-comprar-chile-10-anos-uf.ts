export interface Inputs {
  precio_vivienda_uf: number;
  pie_porcentaje: number;
  tasa_hipoteca_anual: number;
  plazo_hipoteca_anos: number;
  contribucion_anual_uf: number;
  seguro_incendio_anual_porcentaje: number;
  gasto_mantenccion_anual_porcentaje: number;
  arriendo_inicial_uf: number;
  gasto_comun_uf: number;
  ipc_anual_porcentaje: number;
  revalorizacion_vivienda_anual: number;
}

export interface Outputs {
  pie_inicial_uf: number;
  monto_hipoteca_uf: number;
  cuota_mensual_uf: number;
  gastos_compra_totales_uf: number;
  coste_total_compra_10_anos_uf: number;
  coste_arriendo_10_anos_uf: number;
  valor_vivienda_ano_10_uf: number;
  saldo_hipoteca_ano_10_uf: number;
  patrimonio_neto_compra_uf: number;
  diferencia_coste_uf: number;
  breakeven_anos: number;
  tir_compra_porcentaje: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes SII 2026 Chile
  const IMPUESTO_TIMBRE_PORCENTAJE = 0.8; // Ley 18.905
  const NOTARIO_INSCRIPCION_PORCENTAJE = 1.5; // Promedio SII
  const PLAZO_MESES = i.plazo_hipoteca_anos * 12;
  const PERIODO_ANOS = 10;
  const PERIODO_MESES = PERIODO_ANOS * 12;

  // 1. PIE INICIAL
  const pie_inicial_uf = i.precio_vivienda_uf * (i.pie_porcentaje / 100);

  // 2. MONTO HIPOTECA
  const monto_hipoteca_uf = i.precio_vivienda_uf - pie_inicial_uf;

  // 3. CUOTA MENSUAL (SISTEMA FRANCÉS)
  // Cuota = Monto × [i(1+i)^n] / [(1+i)^n - 1]
  const tasa_mensual = i.tasa_hipoteca_anual / 100 / 12;
  const factor_potencia = Math.pow(1 + tasa_mensual, PLAZO_MESES);
  const cuota_mensual_uf =
    monto_hipoteca_uf *
    ((tasa_mensual * factor_potencia) / (factor_potencia - 1));

  // 4. GASTOS COMPRA (TRANSACCIÓN)
  const gastos_compra_totales_uf =
    i.precio_vivienda_uf *
    ((IMPUESTO_TIMBRE_PORCENTAJE + NOTARIO_INSCRIPCION_PORCENTAJE) / 100);

  // 5. COSTE TOTAL COMPRA 10 AÑOS
  let coste_compra = pie_inicial_uf + gastos_compra_totales_uf;
  let saldo_hipoteca_actual = monto_hipoteca_uf;

  for (let mes = 1; mes <= PERIODO_MESES; mes++) {
    // Cuota hipoteca: incluida en cálculo simplificado
    coste_compra += cuota_mensual_uf;
    saldo_hipoteca_actual -= cuota_mensual_uf - (saldo_hipoteca_actual * tasa_mensual);
  }

  // Agregar contribuciones, seguros y mantención anuales
  const seguro_anual = i.precio_vivienda_uf * (i.seguro_incendio_anual_porcentaje / 100);
  const mantenccion_anual = i.precio_vivienda_uf * (i.gasto_mantenccion_anual_porcentaje / 100);
  const gastos_anuales = i.contribucion_anual_uf + seguro_anual + mantenccion_anual;

  coste_compra += gastos_anuales * PERIODO_ANOS;

  // Asegurar saldo positivo
  const saldo_hipoteca_ano_10_uf = Math.max(saldo_hipoteca_actual, 0);

  // 6. COSTE TOTAL ARRIENDO 10 AÑOS
  let coste_arriendo = 0;
  const factor_ipc = 1 + i.ipc_anual_porcentaje / 100;

  for (let ano = 0; ano < PERIODO_ANOS; ano++) {
    const arriendo_ano = i.arriendo_inicial_uf * Math.pow(factor_ipc, ano);
    const gasto_comun_ano = i.gasto_comun_uf * Math.pow(factor_ipc, ano);
    coste_arriendo += (arriendo_ano + gasto_comun_ano) * 12;
  }

  const coste_total_compra_10_anos_uf = coste_compra;
  const coste_total_arriendo_10_anos_uf = coste_arriendo;

  // 7. VALOR VIVIENDA AÑO 10
  const factor_reval = 1 + i.revalorizacion_vivienda_anual / 100;
  const valor_vivienda_ano_10_uf = i.precio_vivienda_uf * Math.pow(factor_reval, PERIODO_ANOS);

  // 8. PATRIMONIO NETO (COMPRA MENOS DEUDA)
  const patrimonio_neto_compra_uf = valor_vivienda_ano_10_uf - saldo_hipoteca_ano_10_uf;

  // 9. DIFERENCIA COSTE
  const diferencia_coste_uf = coste_total_compra_10_anos_uf - coste_total_arriendo_10_anos_uf;

  // 10. BREAKEVEN (PUNTO EQUILIBRIO)
  let breakeven_anos = PERIODO_ANOS;
  let patrimonio_acumulado = pie_inicial_uf + gastos_compra_totales_uf;
  let coste_arriendo_acumulado = 0;
  let saldo_hipoteca_breakeven = monto_hipoteca_uf;

  for (let ano = 1; ano <= PERIODO_ANOS; ano++) {
    // Coste arriendo año actual
    const arriendo_ano = i.arriendo_inicial_uf * Math.pow(factor_ipc, ano - 1);
    const gasto_comun_ano = i.gasto_comun_uf * Math.pow(factor_ipc, ano - 1);
    coste_arriendo_acumulado += (arriendo_ano + gasto_comun_ano) * 12;

    // Patrimonio compra año actual
    const valor_ano = i.precio_vivienda_uf * Math.pow(factor_reval, ano);
    // Saldo hipoteca aproximado (decreciente lineal simplificado)
    const meses_pagados = ano * 12;
    const meses_restantes = Math.max(PLAZO_MESES - meses_pagados, 0);
    const principal_pagado = monto_hipoteca_uf * (meses_pagados / PLAZO_MESES);
    saldo_hipoteca_breakeven = monto_hipoteca_uf - principal_pagado;

    const patrimonio_neto_ano = valor_ano - saldo_hipoteca_breakeven;

    // Revisar si se cruza
    if (patrimonio_neto_ano >= coste_arriendo_acumulado && breakeven_anos === PERIODO_ANOS) {
      breakeven_anos = ano;
    }
  }

  // 11. TIR (TASA INTERNA RETORNO)
  // TIR simplificada: retorno anual neto
  const ganancia_neta_patrimonial = patrimonio_neto_compra_uf - (coste_total_compra_10_anos_uf - gastos_compra_totales_uf - pie_inicial_uf);
  const tir_compra_porcentaje = (Math.pow(ganancia_neta_patrimonial / (pie_inicial_uf + gastos_compra_totales_uf), 1 / PERIODO_ANOS) - 1) * 100;

  // Validaciones
  const resultado: Outputs = {
    pie_inicial_uf: Math.round(pie_inicial_uf * 100) / 100,
    monto_hipoteca_uf: Math.round(monto_hipoteca_uf * 100) / 100,
    cuota_mensual_uf: Math.round(cuota_mensual_uf * 100) / 100,
    gastos_compra_totales_uf: Math.round(gastos_compra_totales_uf * 100) / 100,
    coste_total_compra_10_anos_uf: Math.round(coste_total_compra_10_anos_uf * 100) / 100,
    coste_arriendo_10_anos_uf: Math.round(coste_total_arriendo_10_anos_uf * 100) / 100,
    valor_vivienda_ano_10_uf: Math.round(valor_vivienda_ano_10_uf * 100) / 100,
    saldo_hipoteca_ano_10_uf: Math.round(saldo_hipoteca_ano_10_uf * 100) / 100,
    patrimonio_neto_compra_uf: Math.round(patrimonio_neto_compra_uf * 100) / 100,
    diferencia_coste_uf: Math.round(diferencia_coste_uf * 100) / 100,
    breakeven_anos: Math.round(breakeven_anos * 10) / 10,
    tir_compra_porcentaje: Math.round(Math.max(tir_compra_porcentaje, -50) * 100) / 100,
  };

  return resultado;
}
