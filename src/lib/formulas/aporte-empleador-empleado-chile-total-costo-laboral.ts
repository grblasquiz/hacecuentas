export interface Inputs {
  sueldo_bruto_mensual: number;
  tipo_trabajador: 'dependiente' | 'honorarios';
  incluir_gratificacion: boolean;
  tasa_mutual: number;
}

export interface Outputs {
  cesantia_mensual: number;
  mutual_mensual: number;
  sis_mensual: number;
  gratificacion_mensual: number;
  total_aportes: number;
  costo_laboral_total: number;
  porcentaje_extra: number;
  costo_anual: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile (SII, Superintendencia de Pensiones, ACHS)
  const TASA_CESANTIA = 0.024; // 2.4% obligatorio (art. 162 Código del Trabajo)
  const TASA_SIS = 0.015; // 1.5% Seguro de Invalidez y Sobrevivencia
  const TASA_GRATIFICACION_ANUAL = 0.25; // 25% anual (art. 163 Código del Trabajo)
  const MESES_AÑO = 12;
  
  const sueldo = Math.max(i.sueldo_bruto_mensual, 420000); // Sueldo mínimo 2026
  
  // Si es trabajador a honorarios, no hay aportes obligatorios del empleador
  if (i.tipo_trabajador === 'honorarios') {
    return {
      cesantia_mensual: 0,
      mutual_mensual: 0,
      sis_mensual: 0,
      gratificacion_mensual: 0,
      total_aportes: 0,
      costo_laboral_total: sueldo,
      porcentaje_extra: 0,
      costo_anual: sueldo * MESES_AÑO
    };
  }
  
  // Cálculo para dependiente
  const cesantia = sueldo * TASA_CESANTIA; // 2.4%
  const mutual = sueldo * (i.tasa_mutual / 100); // % variable por sector
  const sis = sueldo * TASA_SIS; // 1.5%
  
  // Gratificación: 25% anual distribuida en 12 meses
  const gratificacion = i.incluir_gratificacion 
    ? sueldo * (TASA_GRATIFICACION_ANUAL / MESES_AÑO) 
    : 0;
  
  const totalAportes = cesantia + mutual + sis + gratificacion;
  const costoTotal = sueldo + totalAportes;
  const porcentajeExtra = (totalAportes / sueldo) * 100;
  const costoAnual = costoTotal * MESES_AÑO;
  
  return {
    cesantia_mensual: Math.round(cesantia),
    mutual_mensual: Math.round(mutual),
    sis_mensual: Math.round(sis),
    gratificacion_mensual: Math.round(gratificacion),
    total_aportes: Math.round(totalAportes),
    costo_laboral_total: Math.round(costoTotal),
    porcentaje_extra: Math.round(porcentajeExtra * 100) / 100,
    costo_anual: Math.round(costoAnual)
  };
}
