export interface Inputs {
  salario_base: number;
  smmlv_2026: number;
}

export interface Outputs {
  aporte_fsp_mensual: number;
  tarifa_aplicada: number;
  rango_smmlv: string;
  aporte_anual: number;
  aplica_fsp: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 FSP
  const UMBRAL_MINIMO_SMMLV = 4; // Aplica a partir de 4 SMMLV
  const SMMLV = i.smmlv_2026 || 1300000; // SMMLV 2026 Colombia (estimado)
  
  // Validar inputs
  const salario = Math.max(0, i.salario_base || 0);
  
  // Calcular rango en SMMLV
  const rangoSmmlv = salario / SMMLV;
  
  // Determinar si aplica FSP
  let aplicaFsp = false;
  let tarifaAplicada = 0;
  let rangoDescripcion = "Sin aplica";
  
  if (rangoSmmlv < UMBRAL_MINIMO_SMMLV) {
    // No aplica FSP
    aplicaFsp = false;
    tarifaAplicada = 0;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (< 4 SMMLV - Exento)`;
  } else if (rangoSmmlv >= 4 && rangoSmmlv < 16) {
    // Tarifa 1.0%
    aplicaFsp = true;
    tarifaAplicada = 0.01;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (4-16 SMMLV - Tarifa 1%)`;
  } else if (rangoSmmlv >= 16 && rangoSmmlv < 17) {
    // Tarifa 1.2%
    aplicaFsp = true;
    tarifaAplicada = 0.012;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (16-17 SMMLV - Tarifa 1.2%)`;
  } else if (rangoSmmlv >= 17 && rangoSmmlv < 18) {
    // Tarifa 1.4%
    aplicaFsp = true;
    tarifaAplicada = 0.014;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (17-18 SMMLV - Tarifa 1.4%)`;
  } else if (rangoSmmlv >= 18) {
    // Tarifa 1.5% (máxima)
    aplicaFsp = true;
    tarifaAplicada = 0.015;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (≥ 18 SMMLV - Tarifa 1.5% máxima)`;
  }
  
  // Calcular aportes
  const aporteMensual = salario * tarifaAplicada;
  const aporteAnual = aporteMensual * 12;
  
  return {
    aporte_fsp_mensual: Math.round(aporteMensual * 100) / 100,
    tarifa_aplicada: tarifaAplicada * 100, // En porcentaje para display
    rango_smmlv: rangoDescripcion,
    aporte_anual: Math.round(aporteAnual * 100) / 100,
    aplica_fsp: aplicaFsp ? "Sí, aplica FSP" : "No aplica FSP (salario < 4 SMMLV)"
  };
}
