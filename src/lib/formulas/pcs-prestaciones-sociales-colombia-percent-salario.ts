export interface Inputs {
  salario_base_mensual: number;
  tipo_empleado: 'independiente_afiliado' | 'dependiente' | 'temporal';
  aplica_icbf: boolean;
}

export interface Outputs {
  cesantias_mensual: number;
  intereses_cesantias: number;
  prima_servicio: number;
  vacaciones_mensual: number;
  prestaciones_basicas_total: number;
  aporte_salud: number;
  aporte_pension: number;
  arl: number;
  parafiscales: number;
  total_seguridad_social: number;
  costo_total_empleado: number;
  porcentaje_adicional: number;
  costo_anual: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN, Ministerio Trabajo
  const SMMLV_2026 = 1300000; // COP - Decreto Ministerio Trabajo enero 2026
  const PCTJ_CESANTIAS = 0.0833; // 8.33% - Código Sustantivo Trabajo
  const PCTJ_INTERESES_CESANTIAS = 0.01; // 1% - Ley 50/1990
  const PCTJ_PRIMA = 0.0833; // 8.33% acumulado - Código Sustantivo
  const PCTJ_VACACIONES = 0.0417; // 4.17% promedio mensual (15 días/360)
  const PCTJ_EPS_EMPLEADOR = 0.085; // 8.5% - Ley 1562/2012, Superfinanciera 2026
  const PCTJ_PENSION_EMPLEADOR = 0.12; // 12% - AFP, Colpensiones - Decreto 1833/2012
  const PCTJ_ARL_PROMEDIO = 0.00522; // 0.522% promedio sector - Ministerio Trabajo
  const PCTJ_ICBF_SENA_CCF = 0.09; // 9% parafiscales (ICBF 3%, SENA 2%, CCF 4%)

  // Validación mínimo legal
  const salario = Math.max(i.salario_base_mensual, SMMLV_2026);

  // 1. PRESTACIONES BÁSICAS (21.83%)
  const cesantias_mensual = salario * PCTJ_CESANTIAS;
  const intereses_cesantias = salario * PCTJ_INTERESES_CESANTIAS;
  const prima_servicio = salario * PCTJ_PRIMA;
  const vacaciones_mensual = salario * PCTJ_VACACIONES;
  const prestaciones_basicas_total =
    cesantias_mensual +
    intereses_cesantias +
    prima_servicio +
    vacaciones_mensual;

  // 2. SEGURIDAD SOCIAL
  const aporte_salud = salario * PCTJ_EPS_EMPLEADOR;
  const aporte_pension = salario * PCTJ_PENSION_EMPLEADOR;
  const arl = salario * PCTJ_ARL_PROMEDIO;

  // 3. PARAFISCALES (solo si dependiente y aplica ICBF)
  let parafiscales = 0;
  if (
    i.tipo_empleado === 'dependiente' &&
    i.aplica_icbf &&
    salario >= SMMLV_2026
  ) {
    parafiscales = salario * PCTJ_ICBF_SENA_CCF;
  } else if (i.tipo_empleado === 'temporal' && i.aplica_icbf) {
    // Temporales pagan parafiscales si está inscrito
    parafiscales = salario * PCTJ_ICBF_SENA_CCF;
  }

  // 4. TOTALES
  const total_seguridad_social = aporte_salud + aporte_pension + arl + parafiscales;
  const costo_total_empleado = salario + prestaciones_basicas_total + total_seguridad_social;
  const porcentaje_adicional = (prestaciones_basicas_total + total_seguridad_social) / salario;
  const costo_anual = costo_total_empleado * 12;

  return {
    cesantias_mensual: Math.round(cesantias_mensual),
    intereses_cesantias: Math.round(intereses_cesantias),
    prima_servicio: Math.round(prima_servicio),
    vacaciones_mensual: Math.round(vacaciones_mensual),
    prestaciones_basicas_total: Math.round(prestaciones_basicas_total),
    aporte_salud: Math.round(aporte_salud),
    aporte_pension: Math.round(aporte_pension),
    arl: Math.round(arl),
    parafiscales: Math.round(parafiscales),
    total_seguridad_social: Math.round(total_seguridad_social),
    costo_total_empleado: Math.round(costo_total_empleado),
    porcentaje_adicional: Math.round(porcentaje_adicional * 10000) / 100,
    costo_anual: Math.round(costo_anual),
  };
}
