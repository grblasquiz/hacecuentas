export interface Inputs {
  ingreso_bruto_anual: number;
  mes_calculo?: number;
  aplicar_tope_uf?: boolean;
}

export interface Outputs {
  base_cotizable_80_pct: number;
  base_cotizable_tope: number;
  cotizacion_afp: number;
  comision_afp: number;
  cotizacion_salud: number;
  cotizacion_cesantia: number;
  total_cotizacion_obligatoria: number;
  ingreso_neto_anual: number;
  ingreso_mensual_promedio: number;
  cotizacion_mensual_promedio: number;
  tasa_efectiva: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile (SII + SP + CMF)
  const UF_2026 = 38350; // Valor UF enero 2026 (Banco Central)
  const TOPE_MENSUAL_UF = 84.3; // Ley 21.133
  const TOPE_MENSUAL_CLP = TOPE_MENSUAL_UF * UF_2026; // ~3.234.960
  const PORCENTAJE_BASE_80 = 0.80; // Base sobre 80% renta
  const TASA_AFP = 0.10; // AFP 10%
  const COMISION_AFP_PROMEDIO = 0.0079; // Promedio 2026 (~0.79%)
  const TASA_SALUD = 0.07; // Salud 7%
  const TASA_CESANTIA = 0.008; // Cesantía 0.8%
  
  // Validación básica
  if (i.ingreso_bruto_anual < 0) {
    return {
      base_cotizable_80_pct: 0,
      base_cotizable_tope: 0,
      cotizacion_afp: 0,
      comision_afp: 0,
      cotizacion_salud: 0,
      cotizacion_cesantia: 0,
      total_cotizacion_obligatoria: 0,
      ingreso_neto_anual: i.ingreso_bruto_anual,
      ingreso_mensual_promedio: 0,
      cotizacion_mensual_promedio: 0,
      tasa_efectiva: 0
    };
  }
  
  // Paso 1: Calcular base sobre 80%
  const base_80_pct = i.ingreso_bruto_anual * PORCENTAJE_BASE_80;
  
  // Paso 2: Aplicar tope máximo 84,3 UF si está habilitado
  const aplicar_tope = i.aplicar_tope_uf !== false; // Por defecto, aplicar
  const base_con_tope = aplicar_tope 
    ? Math.min(base_80_pct, TOPE_MENSUAL_CLP)
    : base_80_pct;
  
  // Paso 3: Calcular componentes de cotización
  const cotizacion_afp_base = base_con_tope * TASA_AFP; // 10%
  const comision_afp_calculo = base_con_tope * COMISION_AFP_PROMEDIO; // ~0.79%
  const cotizacion_salud_calculo = base_con_tope * TASA_SALUD; // 7%
  const cotizacion_cesantia_calculo = base_con_tope * TASA_CESANTIA; // 0.8%
  
  // Paso 4: Total cotización obligatoria anual
  const total_cotizacion_anual = 
    cotizacion_afp_base + 
    comision_afp_calculo + 
    cotizacion_salud_calculo + 
    cotizacion_cesantia_calculo;
  
  // Paso 5: Calcular neto anual
  const ingreso_neto_anual = i.ingreso_bruto_anual - total_cotizacion_anual;
  
  // Paso 6: Promedios mensuales
  const meses_considerar = i.mes_calculo ? 1 : 12;
  const ingreso_mensual_promedio = i.ingreso_bruto_anual / 12;
  const cotizacion_mensual_promedio = total_cotizacion_anual / 12;
  
  // Paso 7: Tasa efectiva
  const tasa_efectiva = i.ingreso_bruto_anual > 0 
    ? (total_cotizacion_anual / i.ingreso_bruto_anual) * 100
    : 0;
  
  return {
    base_cotizable_80_pct: Math.round(base_80_pct),
    base_cotizable_tope: Math.round(base_con_tope),
    cotizacion_afp: Math.round(cotizacion_afp_base),
    comision_afp: Math.round(comision_afp_calculo),
    cotizacion_salud: Math.round(cotizacion_salud_calculo),
    cotizacion_cesantia: Math.round(cotizacion_cesantia_calculo),
    total_cotizacion_obligatoria: Math.round(total_cotizacion_anual),
    ingreso_neto_anual: Math.round(ingreso_neto_anual),
    ingreso_mensual_promedio: Math.round(ingreso_mensual_promedio),
    cotizacion_mensual_promedio: Math.round(cotizacion_mensual_promedio),
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100
  };
}
