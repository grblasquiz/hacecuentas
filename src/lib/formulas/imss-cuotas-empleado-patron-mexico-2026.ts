export interface Inputs {
  sbc_empleado: number;
}

export interface Outputs {
  cuota_empleado_enfermedades: number;
  cuota_empleado_gmp: number;
  cuota_empleado_invalidez: number;
  cuota_empleado_cesantia: number;
  cuota_empleado_total: number;
  sbc_tope: number;
  cuota_patron_riesgo: number;
  cuota_patron_enfermedades: number;
  cuota_patron_invalidez: number;
  cuota_patron_cesantia: number;
  cuota_patron_guarderia: number;
  cuota_patron_total: number;
  costo_total_empleado: number;
  porcentaje_costo_total: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - IMSS
  // Fuente: INEGI (UMA), IMSS (tasas)
  const UMA_2026 = 313.75; // Unidad de Medida y Actualización 2026
  const TOPE_SBC_UMA = 25; // Tope en UMA según IMSS
  const SBC_MAXIMO = UMA_2026 * TOPE_SBC_UMA; // $7,843.75

  // Tasas cuota empleado (porcentajes)
  const TASA_EMPLEADO_ENFERMEDADES = 0.004; // 0.40%
  const TASA_EMPLEADO_GMP = 0.0025; // 0.25%
  const TASA_EMPLEADO_INVALIDEZ = 0.00625; // 0.625%
  const TASA_EMPLEADO_CESANTIA = 0.01125; // 1.125%
  const TASA_EMPLEADO_TOTAL = TASA_EMPLEADO_ENFERMEDADES + TASA_EMPLEADO_GMP + TASA_EMPLEADO_INVALIDEZ + TASA_EMPLEADO_CESANTIA;

  // Tasas cuota patrón (porcentajes)
  const TASA_PATRON_RIESGO = 0.0054; // 0.54% promedio riesgo de trabajo
  const TASA_PATRON_ENFERMEDADES = 0.087; // 8.70%
  const TASA_PATRON_INVALIDEZ = 0.025; // 2.50%
  const TASA_PATRON_CESANTIA = 0.0315; // 3.15%
  const TASA_PATRON_GUARDERIA = 0.01; // 1.00%
  const TASA_PATRON_TOTAL = TASA_PATRON_RIESGO + TASA_PATRON_ENFERMEDADES + TASA_PATRON_INVALIDEZ + TASA_PATRON_CESANTIA + TASA_PATRON_GUARDERIA;

  // Validación y manejo de entrada
  const sbc = Math.max(0, i.sbc_empleado || 0);

  // SBC aplicable (se topa en máximo)
  const sbc_tope = Math.min(sbc, SBC_MAXIMO);

  // Cálculo cuota empleado
  const cuota_empleado_enfermedades = sbc_tope * TASA_EMPLEADO_ENFERMEDADES;
  const cuota_empleado_gmp = sbc_tope * TASA_EMPLEADO_GMP;
  const cuota_empleado_invalidez = sbc_tope * TASA_EMPLEADO_INVALIDEZ;
  const cuota_empleado_cesantia = sbc_tope * TASA_EMPLEADO_CESANTIA;
  const cuota_empleado_total = sbc_tope * TASA_EMPLEADO_TOTAL;

  // Cálculo cuota patrón
  const cuota_patron_riesgo = sbc_tope * TASA_PATRON_RIESGO;
  const cuota_patron_enfermedades = sbc_tope * TASA_PATRON_ENFERMEDADES;
  const cuota_patron_invalidez = sbc_tope * TASA_PATRON_INVALIDEZ;
  const cuota_patron_cesantia = sbc_tope * TASA_PATRON_CESANTIA;
  const cuota_patron_guarderia = sbc_tope * TASA_PATRON_GUARDERIA;
  const cuota_patron_total = sbc_tope * TASA_PATRON_TOTAL;

  // Cálculos finales
  const costo_total_empleado = cuota_empleado_total + cuota_patron_total;
  const porcentaje_costo_total = sbc_tope > 0 ? (costo_total_empleado / sbc_tope) * 100 : 0;

  return {
    cuota_empleado_enfermedades: Math.round(cuota_empleado_enfermedades * 100) / 100,
    cuota_empleado_gmp: Math.round(cuota_empleado_gmp * 100) / 100,
    cuota_empleado_invalidez: Math.round(cuota_empleado_invalidez * 100) / 100,
    cuota_empleado_cesantia: Math.round(cuota_empleado_cesantia * 100) / 100,
    cuota_empleado_total: Math.round(cuota_empleado_total * 100) / 100,
    sbc_tope: Math.round(sbc_tope * 100) / 100,
    cuota_patron_riesgo: Math.round(cuota_patron_riesgo * 100) / 100,
    cuota_patron_enfermedades: Math.round(cuota_patron_enfermedades * 100) / 100,
    cuota_patron_invalidez: Math.round(cuota_patron_invalidez * 100) / 100,
    cuota_patron_cesantia: Math.round(cuota_patron_cesantia * 100) / 100,
    cuota_patron_guarderia: Math.round(cuota_patron_guarderia * 100) / 100,
    cuota_patron_total: Math.round(cuota_patron_total * 100) / 100,
    costo_total_empleado: Math.round(costo_total_empleado * 100) / 100,
    porcentaje_costo_total: Math.round(porcentaje_costo_total * 100) / 100
  };
}
