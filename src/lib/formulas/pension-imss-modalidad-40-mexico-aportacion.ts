export interface Inputs {
  salario_base_cotizacion_uma: number;
  anos_aportacion_previos: number;
  semanas_previas: number;
  anos_modalidad_40: number;
  edad_actual: number;
  genero: 'hombre' | 'mujer';
  incremento_anual_salario: number;
}

export interface Outputs {
  uma_vigente: number;
  cuota_mensual_inicial: number;
  cuota_mensual_promedio_5anos: number;
  aportacion_acumulada_5anos: number;
  semanas_totales_al_cierre: number;
  edad_pension: number;
  pension_mensual_ley73: number;
  pension_anual_ley73: number;
  pension_garantizada_minimo: number;
  comparativa_afore_pension_mensual: number;
  diferencia_modalidad_vs_afore: number;
  breakeven_meses: number;
  roi_anual_modalidad40: number;
  valor_presente_pension_20anos: number;
  valor_presente_neto_20anos: number;
  mensaje_recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México (SAT, IMSS, CONAPO, Banxico)
  const UMA_VIGENTE = 248.93; // UMA 2026 (SAT)
  const TASA_APORTACION = 0.10075; // 10.075% (IMSS: 5.15% patrón + 4.925% trabajador)
  const SALARIO_MINIMO_2026 = 248.93; // Aproximado, región central
  const PENSION_GARANTIZADA_MINIMA = 5500; // ~55% salario mínimo IMSS 2026
  const TASA_DESCUENTO_VPN = 0.04; // 4% anual (Banxico referencia)
  const ESPERANZA_VIDA_HOMBRE = 81; // CONAPO 2026
  const ESPERANZA_VIDA_MUJER = 87; // CONAPO 2026
  const INFLACION_ANUAL = 0.035; // 3.5% base, pero se ajusta con input

  // Validaciones básicas
  if (i.salario_base_cotizacion_uma < 1 || i.salario_base_cotizacion_uma > 25) {
    return {
      uma_vigente: UMA_VIGENTE,
      cuota_mensual_inicial: 0,
      cuota_mensual_promedio_5anos: 0,
      aportacion_acumulada_5anos: 0,
      semanas_totales_al_cierre: 0,
      edad_pension: 0,
      pension_mensual_ley73: 0,
      pension_anual_ley73: 0,
      pension_garantizada_minimo: PENSION_GARANTIZADA_MINIMA,
      comparativa_afore_pension_mensual: 0,
      diferencia_modalidad_vs_afore: 0,
      breakeven_meses: 0,
      roi_anual_modalidad40: 0,
      valor_presente_pension_20anos: 0,
      valor_presente_neto_20anos: 0,
      mensaje_recomendacion: 'Error: UMA debe estar entre 1 y 25.'
    };
  }

  // 1. Cálculo de salario base en MXN
  const salario_base_mxn = i.salario_base_cotizacion_uma * UMA_VIGENTE;

  // 2. Cuota mensual inicial
  const cuota_mensual_inicial = salario_base_mxn * TASA_APORTACION;

  // 3. Aportación acumulada en 5 años con incremento anual
  let aportacion_acumulada = 0;
  let cuota_anual_acumulada = [];
  for (let ano = 0; ano < Math.min(i.anos_modalidad_40, 5); ano++) {
    const factor_incremento = Math.pow(1 + i.incremento_anual_salario / 100, ano);
    const cuota_ano = cuota_mensual_inicial * factor_incremento * 12;
    cuota_anual_acumulada.push(cuota_ano);
    aportacion_acumulada += cuota_ano;
  }
  const cuota_mensual_promedio_5anos =
    cuota_anual_acumulada.length > 0
      ? aportacion_acumulada / (cuota_anual_acumulada.length * 12)
      : cuota_mensual_inicial;

  // 4. Semanas cotizadas totales
  const semanas_previas_total =
    i.anos_aportacion_previos * 52 + i.semanas_previas;
  const semanas_nuevas_modalidad40 = i.anos_modalidad_40 * 52;
  const semanas_totales_al_cierre =
    semanas_previas_total + semanas_nuevas_modalidad40;

  // 5. Edad de pensión
  const edad_pension_minima = i.genero === 'hombre' ? 60 : 55; // Transición 2023-2030
  const edad_pension =
    i.edad_actual + i.anos_modalidad_40 >= edad_pension_minima
      ? i.edad_actual + i.anos_modalidad_40
      : edad_pension_minima;

  // 6. Cálculo de pensión Ley 73 (Seguro de Vida IMSS)
  // Factor actuarial aproximado (tabla IMSS 2026)
  const factores_actuariales: { [key: string]: number } = {
    'hombre-60': 0.85,
    'hombre-65': 0.82,
    'mujer-55': 0.78,
    'mujer-60': 0.75
  };
  const clave_factor = `${i.genero}-${Math.min(edad_pension, 65)}`;
  const factor_actuarial = factores_actuariales[clave_factor] || 0.85;

  // Pensión = Salario Base × Factor Actuarial × (Semanas / 500)
  // Máximo: valor máximo de pensión = 10 × salario mínimo
  const pension_bruta =
    salario_base_mxn * factor_actuarial * (semanas_totales_al_cierre / 500);
  const pension_mensual_ley73 =
    semanas_totales_al_cierre >= 500
      ? Math.max(pension_bruta, PENSION_GARANTIZADA_MINIMA)
      : 0;
  const pension_anual_ley73 = pension_mensual_ley73 * 12;

  // 7. Comparativa AFORE Ley 97
  // Asumiendo 4.5% rendimiento anual, saldo acumulado
  const rendimiento_afore = 0.045; // 4.5% promedio CONSAR 2026
  let saldo_afore = aportacion_acumulada;
  for (let ano = 0; ano < 1; ano++) {
    // Simplificado: 1 año de rendimiento
    saldo_afore *= 1 + rendimiento_afore;
  }
  const esperanza_vida =
    i.genero === 'hombre' ? ESPERANZA_VIDA_HOMBRE : ESPERANZA_VIDA_MUJER;
  const meses_esperados_vida =
    (esperanza_vida - edad_pension) * 12 + 6; // Promedio 6 meses más
  const comparativa_afore_pension_mensual =
    saldo_afore > 0 ? saldo_afore / meses_esperados_vida : 0;

  // 8. Diferencia y ROI
  const diferencia_modalidad_vs_afore =
    pension_mensual_ley73 - comparativa_afore_pension_mensual;
  const beneficio_neto_mensual =
    pension_mensual_ley73 - cuota_mensual_promedio_5anos;
  const roi_anual_modalidad40 =
    cuota_mensual_promedio_5anos > 0
      ? (beneficio_neto_mensual / cuota_mensual_promedio_5anos) * 100
      : 0;

  // 9. Breakeven (meses para recuperar inversión)
  const breakeven_meses =
    beneficio_neto_mensual > 0
      ? aportacion_acumulada / beneficio_neto_mensual
      : 999;

  // 10. Valor Presente Neto (VPN) para 20 años de jubilación
  const meses_jubilacion = 20 * 12; // 240 meses
  let vpn_pensiones = 0;
  const tasa_descuento_mensual = Math.pow(1 + TASA_DESCUENTO_VPN, 1 / 12) - 1;
  for (let mes = 1; mes <= meses_jubilacion; mes++) {
    const factor_descuento = Math.pow(1 + tasa_descuento_mensual, mes);
    vpn_pensiones += pension_mensual_ley73 / factor_descuento;
  }
  const valor_presente_pension_20anos = vpn_pensiones;
  const valor_presente_neto_20anos =
    vpn_pensiones - aportacion_acumulada;

  // 11. Mensaje de recomendación
  let mensaje_recomendacion = '';
  if (semanas_totales_al_cierre < 500) {
    mensaje_recomendacion =
      '⚠️ Semanas insuficientes: No calificas para pensión. Acumula mínimo 500 semanas.';
  } else if (valor_presente_neto_20anos > 500000) {
    mensaje_recomendacion =
      '✅ Modalidad 40 es altamente rentable. VPN positivo: $' +
      valor_presente_neto_20anos.toLocaleString('es-MX', {
        maximumFractionDigits: 0
      }) +
      ' MXN en 20 años de jubilación.';
  } else if (diferencia_modalidad_vs_afore > 1000) {
    mensaje_recomendacion =
      '✅ Modalidad 40 ventajosa vs. AFORE: +$' +
      diferencia_modalidad_vs_afore.toLocaleString('es-MX', {
        maximumFractionDigits: 0
      }) +
      ' MXN/mes. Pensión garantizada y segura.';
  } else if (diferencia_modalidad_vs_afore < 0) {
    mensaje_recomendacion =
      '⚠️ AFORE puede ofrecer mayor pensión. Diferencia: -$' +
      Math.abs(diferencia_modalidad_vs_afore).toLocaleString('es-MX', {
        maximumFractionDigits: 0
      }) +
      ' MXN/mes. Pero Modalidad 40 es más segura.';
  } else {
    mensaje_recomendacion =
      '➡️ Modalidad 40 y AFORE comparable. Elige según preferencia: seguridad (IMSS) vs. potencial rendimiento (AFORE).';
  }

  return {
    uma_vigente: UMA_VIGENTE,
    cuota_mensual_inicial: Math.round(cuota_mensual_inicial * 100) / 100,
    cuota_mensual_promedio_5anos:
      Math.round(cuota_mensual_promedio_5anos * 100) / 100,
    aportacion_acumulada_5anos:
      Math.round(aportacion_acumulada * 100) / 100,
    semanas_totales_al_cierre: Math.round(semanas_totales_al_cierre),
    edad_pension: edad_pension,
    pension_mensual_ley73: Math.round(pension_mensual_ley73 * 100) / 100,
    pension_anual_ley73: Math.round(pension_anual_ley73 * 100) / 100,
    pension_garantizada_minimo: PENSION_GARANTIZADA_MINIMA,
    comparativa_afore_pension_mensual:
      Math.round(comparativa_afore_pension_mensual * 100) / 100,
    diferencia_modalidad_vs_afore:
      Math.round(diferencia_modalidad_vs_afore * 100) / 100,
    breakeven_meses: Math.round(breakeven_meses * 10) / 10,
    roi_anual_modalidad40: Math.round(roi_anual_modalidad40 * 100) / 100,
    valor_presente_pension_20anos:
      Math.round(valor_presente_pension_20anos * 100) / 100,
    valor_presente_neto_20anos:
      Math.round(valor_presente_neto_20anos * 100) / 100,
    mensaje_recomendacion: mensaje_recomendacion
  };
}
