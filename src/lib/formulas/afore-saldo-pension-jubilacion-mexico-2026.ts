export interface Inputs {
  edad_actual: number;
  edad_retiro: 60 | 62 | 65;
  salario_mensual_actual: number;
  semanas_cotizadas: number;
  saldo_actual_afore: number;
  saldo_vivienda: number;
  aporte_voluntario_mensual: number;
  rendimiento_anual_esperado: number;
  inflacion_anual: number;
  afore_comision: number;
  aplicar_siv: 'si' | 'no';
}

export interface Outputs {
  saldo_proyectado_retiro: number;
  semanas_faltantes: number;
  anos_laborales_restantes: number;
  pension_mensual_vitalicia: number;
  pension_mensual_fondo: number;
  tasa_reemplazo: number;
  contribucion_total_estimada: number;
  diferencia_ley_97_vs_ley_73: number;
  saldo_herencia_esperada: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México (SAT, IMSS, CONSAR, Banxico)
  const MINIMO_SEMANAS_RETIRO = 1250; // Mínimo Ley 97 IMSS
  const SEMANAS_ANTICIPADO = 1300;
  const FACTOR_OBRERO_COTIZACION = 0.01125; // 1.125% SAT 2026
  const FACTOR_PATRONAL_COTIZACION = 0.0515; // 5.15% SAT 2026
  const FACTOR_SIV = 0.00625; // 0.625% SAT 2026 (Seguro Invalidez Vida)
  const PENSION_GARANTIZADA_MXN = 3150; // IMSS mínimo 2026 aprox.
  const ESPERANZA_VIDA_65 = 18.8; // INEGI 2026 (años)
  const MESES_ESPERANZA = ESPERANZA_VIDA_65 * 12; // ~225 meses

  // Factores CONSAR 2026 por edad (simplificado, sin sexo)
  const factoresConsar: { [key: number]: number } = {
    60: 255,  // Factor renta vitalicia edad 60
    62: 235,
    65: 210,
    70: 170
  };

  const factorRetiro = factoresConsar[i.edad_retiro] || 210;

  // Validar que edad retiro sea válida
  const edadRetiroValida = [60, 62, 65].includes(i.edad_retiro) ? i.edad_retiro : 65;

  // Calcular años hasta retiro
  const anos_laborales_restantes = Math.max(0, edadRetiroValida - i.edad_actual);

  // Calcular rendimiento neto (anual - comisión)
  const rendimiento_neto = (i.rendimiento_anual_esperado - i.afore_comision) / 100;

  // Aportes anuales
  const aporte_obrero_anual = i.salario_mensual_actual * FACTOR_OBRERO_COTIZACION * 12;
  const aporte_patronal_anual = i.salario_mensual_actual * FACTOR_PATRONAL_COTIZACION * 12;
  const aporte_siv_anual = i.aplicar_siv === 'si' ? i.salario_mensual_actual * FACTOR_SIV * 12 : 0;
  const aporte_voluntario_anual = i.aporte_voluntario_mensual * 12;

  const aporte_obligatorio_anual = aporte_obrero_anual + aporte_patronal_anual + aporte_siv_anual;
  const aporte_total_anual = aporte_obligatorio_anual + aporte_voluntario_anual;

  // Contribución total acumulada
  const contribucion_total_estimada = aporte_total_anual * anos_laborales_restantes;

  // Proyectar saldo con fórmula de valor futuro
  // VF = VA × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
  const factor_crecimiento = Math.pow(1 + rendimiento_neto, anos_laborales_restantes);
  const saldo_proyectado_base = i.saldo_actual_afore * factor_crecimiento;

  let saldo_proyectado_aportes = 0;
  if (rendimiento_neto !== 0) {
    saldo_proyectado_aportes =
      aporte_total_anual * ((factor_crecimiento - 1) / rendimiento_neto);
  } else {
    // Si r = 0, es suma simple
    saldo_proyectado_aportes = aporte_total_anual * anos_laborales_restantes;
  }

  const saldo_proyectado_retiro = Math.round(
    saldo_proyectado_base + saldo_proyectado_aportes
  );

  // Semanas faltantes
  const semanas_faltantes = Math.max(
    0,
    MINIMO_SEMANAS_RETIRO - i.semanas_cotizadas
  );

  // Pensión modalidad renta vitalicia (CONSAR)
  const pension_mensual_vitalicia_bruta = saldo_proyectado_retiro / factorRetiro;
  const pension_mensual_vitalicia = Math.max(
    PENSION_GARANTIZADA_MXN,
    Math.round(pension_mensual_vitalicia_bruta)
  );

  // Pensión modalidad retiro programado (fondo)
  const pension_mensual_fondo_bruta = saldo_proyectado_retiro / MESES_ESPERANZA;
  const pension_mensual_fondo = Math.max(
    PENSION_GARANTIZADA_MXN,
    Math.round(pension_mensual_fondo_bruta)
  );

  // Tasa de reemplazo (%)
  const tasa_reemplazo = i.salario_mensual_actual > 0
    ? Math.round((pension_mensual_vitalicia / i.salario_mensual_actual) * 10000) / 100
    : 0;

  // Diferencia Ley 97 vs Ley 73 (simplificada)
  // Ley 73: rendimiento garantizado 2%, sin heredabilidad
  // Ley 97: variable, herencia disponible
  const factor_ley73 = Math.pow(1.02, anos_laborales_restantes);
  const saldo_ley73 = i.saldo_actual_afore * factor_ley73 +
    aporte_total_anual * ((factor_ley73 - 1) / 0.02 || anos_laborales_restantes);
  const diferencia_ley_97_vs_ley_73 = Math.round(
    saldo_proyectado_retiro - saldo_ley73
  );

  // Saldo herencia esperada (retiro programado solo)
  // Si falleces durante retiro programado, heredan el saldo restante
  // Simplificación: asumimos fallecimiento a esperanza de vida = saldo ~0
  // Pero si es renta vitalicia, no hay herencia de saldo (es seguro)
  // Aquí mostramos lo que quedaría en fondo si mueres antes de agotar
  const saldo_herencia_esperada = Math.round(
    saldo_proyectado_retiro - (pension_mensual_fondo * MESES_ESPERANZA * 0.75)
  ); // 75% de vida esperada

  return {
    saldo_proyectado_retiro,
    semanas_faltantes,
    anos_laborales_restantes,
    pension_mensual_vitalicia,
    pension_mensual_fondo,
    tasa_reemplazo,
    contribucion_total_estimada: Math.round(contribucion_total_estimada),
    diferencia_ley_97_vs_ley_73,
    saldo_herencia_esperada: Math.max(0, saldo_herencia_esperada)
  };
}
