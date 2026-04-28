export interface Inputs {
  edad_actual: number;
  genero: 'hombre' | 'mujer';
  salario_mensual: number;
  semanas_cotizadas: number;
  capital_acumulado_rais: number;
  aporte_mensual_rais: number;
  rendimiento_anual_esperado: number;
  salario_promedio_rpm: number;
  expectativa_vida: number;
  inflation_anual: number;
}

export interface Outputs {
  edad_jubilacion_rais: number;
  edad_jubilacion_rpm: number;
  capital_final_rais: number;
  pension_mensual_rais: number;
  pension_mensual_rpm: number;
  diferencia_mensual: number;
  puede_trasladarse: string;
  ventana_traslado_activa: string;
  requiere_semanas_rpm: number;
  pension_mensual_rpm_inflacion: number;
  rendimiento_total_rais: number;
}

export function compute(i: Inputs): Outputs {
  // CONSTANTES 2026 COLOMBIA - FUENTES: DIAN, Colpensiones, Superintendencia Financiera
  const UPC_2026 = 1393044; // Valor UPC abril 2026, DIAN
  const CAPITAL_MINIMO_RAIS = UPC_2026; // Mínimo capital para pensión RAIS
  const SEMANAS_REQUERIDAS_RPM = 1300; // Ley 797/2003
  const EDAD_JUBILACION_HOMBRES_RPM = 62; // Actualizado 2026, Acto Legislativo 005/2003
  const EDAD_JUBILACION_MUJERES_RPM = 57; // Actualizado 2025
  const VENTANA_TRASLADO_HOMBRES_MIN = 35;
  const VENTANA_TRASLADO_HOMBRES_MAX = 47;
  const VENTANA_TRASLADO_MUJERES_MIN = 32;
  const VENTANA_TRASLADO_MUJERES_MAX = 42;
  const FACTOR_PRESTACIONAL_RPM = 0.65; // Para 1.300 semanas (Colpensiones)
  const PENSION_MAXIMA_RPM_PORCENTAJE = 0.8; // Máximo 80% salario promedio
  const AÑOS_JUBILACION_DEFECTO_RAIS = 25; // Edad jubilación RAIS = actual + 25

  // Determinar edad jubilación RPM según género
  const edad_jubilacion_rpm =
    i.genero === 'hombre' ? EDAD_JUBILACION_HOMBRES_RPM : EDAD_JUBILACION_MUJERES_RPM;

  // Edad jubilación RAIS (flexible, aquí modelada como +25 años)
  const edad_jubilacion_rais = i.edad_actual + AÑOS_JUBILACION_DEFECTO_RAIS;

  // CÁLCULO RAIS: Capital final a jubilación
  const anos_hasta_jubilacion_rais = edad_jubilacion_rais - i.edad_actual;
  const meses_hasta_jubilacion_rais = anos_hasta_jubilacion_rais * 12;
  const r_mensual = i.rendimiento_anual_esperado / 100 / 12; // Tasa mensual

  // Fórmula capital compuesto: C_0 * (1+r)^n + A * [((1+r)^n - 1) / r]
  const capital_compuesto = i.capital_acumulado_rais * Math.pow(1 + r_mensual, meses_hasta_jubilacion_rais);
  const factor_series = r_mensual !== 0 
    ? (Math.pow(1 + r_mensual, meses_hasta_jubilacion_rais) - 1) / r_mensual
    : meses_hasta_jubilacion_rais;
  const aportes_capitalizados = i.aporte_mensual_rais * factor_series;
  const capital_final_rais = capital_compuesto + aportes_capitalizados;

  // Rendimiento total acumulado RAIS
  const aportes_totales = i.capital_acumulado_rais + (i.aporte_mensual_rais * meses_hasta_jubilacion_rais);
  const rendimiento_total_rais = Math.max(0, capital_final_rais - aportes_totales);

  // CÁLCULO RAIS: Pensión mensual (anualidad actuarial simplificada)
  // Factor anualidad = 12 * (expectativa_vida - edad_jubilacion) * (1 + TIR_retiros)^-0.5
  // TIR_retiros ≈ rendimiento / 2 (conservador)
  const anos_retiro = Math.max(1, i.expectativa_vida - edad_jubilacion_rais);
  const tir_retiros = i.rendimiento_anual_esperado / 100 / 2;
  const factor_actuarial = 12 * anos_retiro * Math.pow(1 + tir_retiros, -0.5);
  const pension_mensual_rais = capital_final_rais / Math.max(1, factor_actuarial);

  // CÁLCULO RPM: Pensión mensual (Colpensiones)
  // Fórmula: Salario_promedio × (Semanas_cotizadas / 1.300) × 0.65, máx 80%
  const factor_semanas = i.semanas_cotizadas / SEMANAS_REQUERIDAS_RPM;
  const pension_bruta_rpm = i.salario_promedio_rpm * factor_semanas * FACTOR_PRESTACIONAL_RPM;
  const pension_maxima_rpm = i.salario_promedio_rpm * PENSION_MAXIMA_RPM_PORCENTAJE;
  const pension_mensual_rpm = Math.min(pension_bruta_rpm, pension_maxima_rpm);

  // Ajuste RPM por inflación (proyecta pesos hoy)
  const anos_hasta_jubilacion_rpm = edad_jubilacion_rpm - i.edad_actual;
  const factor_inflacion = Math.pow(1 + i.inflation_anual / 100, anos_hasta_jubilacion_rpm);
  const pension_mensual_rpm_inflacion = pension_mensual_rpm / factor_inflacion;

  // VALIDAR TRASLADO
  // 1. ¿Está en ventana de edad?
  const ventana_min = i.genero === 'hombre' ? VENTANA_TRASLADO_HOMBRES_MIN : VENTANA_TRASLADO_MUJERES_MIN;
  const ventana_max = i.genero === 'hombre' ? VENTANA_TRASLADO_HOMBRES_MAX : VENTANA_TRASLADO_MUJERES_MAX;
  const esta_en_ventana = i.edad_actual >= ventana_min && i.edad_actual <= ventana_max;
  const ventana_traslado_activa = esta_en_ventana
    ? `Sí. Tienes hasta los ${ventana_max} años (${ventana_max - i.edad_actual} años restantes)`
    : `No. Ventana cerrada (${ventana_min}-${ventana_max} años para ${i.genero === 'hombre' ? 'hombres' : 'mujeres'})`;

  // 2. ¿Cumple 1.300 semanas?
  const semanas_faltantes = Math.max(0, SEMANAS_REQUERIDAS_RPM - i.semanas_cotizadas);
  const cumple_semanas = i.semanas_cotizadas >= SEMANAS_REQUERIDAS_RPM;

  // Conclusión traslado
  let puede_trasladarse_texto = '';
  if (esta_en_ventana && cumple_semanas) {
    puede_trasladarse_texto = '✓ SÍ. Estás en ventana legal y cumples 1.300 semanas. Puedes trasladarte a RPM.';
  } else if (esta_en_ventana && !cumple_semanas) {
    puede_trasladarse_texto = `⚠ VENTANA ACTIVA pero faltan ${semanas_faltantes} semanas. Debes completarlas antes de trasladarte.`;
  } else if (!esta_en_ventana && cumple_semanas) {
    puede_trasladarse_texto = '✗ NO. Ventana cerrada. Aunque cumples semanas, ya no puedes trasladarte (permaneces RAIS).';
  } else {
    puede_trasladarse_texto = `✗ NO. Ventana cerrada + faltan ${semanas_faltantes} semanas. Permanecerás en RAIS.`;
  }

  // Diferencia pensiones (RAIS - RPM)
  const diferencia_mensual = pension_mensual_rais - pension_mensual_rpm;

  return {
    edad_jubilacion_rais: Math.round(edad_jubilacion_rais * 10) / 10,
    edad_jubilacion_rpm: edad_jubilacion_rpm,
    capital_final_rais: Math.round(capital_final_rais),
    pension_mensual_rais: Math.round(pension_mensual_rais),
    pension_mensual_rpm: Math.round(pension_mensual_rpm),
    diferencia_mensual: Math.round(diferencia_mensual),
    puede_trasladarse: puede_trasladarse_texto,
    ventana_traslado_activa: ventana_traslado_activa,
    requiere_semanas_rpm: semanas_faltantes,
    pension_mensual_rpm_inflacion: Math.round(pension_mensual_rpm_inflacion),
    rendimiento_total_rais: Math.round(rendimiento_total_rais)
  };
}
