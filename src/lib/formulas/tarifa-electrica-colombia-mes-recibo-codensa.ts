export interface Inputs {
  estrato: number;
  consumo_kwh: number;
  aplicar_restriccion: boolean;
  porcentaje_punta?: number;
}

export interface Outputs {
  generacion_kwh: number;
  transmision_kwh: number;
  distribucion_kwh: number;
  comercializacion_kwh: number;
  contribucion_subsidio: number;
  subtotal_kwh: number;
  alumbrado_publico: number;
  aseo_contribucion: number;
  total_recibo: number;
  promedio_kwh: number;
  anual_estimado: number;
}

export function compute(i: Inputs): Outputs {
  // Tarifas CREG 2026 (COP/kWh) - Resolución 015/2026
  const TARIFA_GENERACION = 385; // $/kWh
  const TARIFA_TRANSMISION = 52; // $/kWh
  const TARIFA_DISTRIBUCION = 178; // $/kWh (Codensa Bogotá)
  const TARIFA_COMERCIALIZACION = 65; // $/kWh

  // Cargos fijos mensuales (COP) - por estrato
  const ALUMBRADO_PUBLICO_BASE = {
    1: 9200,
    2: 9200,
    3: 18500,
    4: 22800,
    5: 27500,
    6: 27500,
  };
  const ASEO_CONTRIBUCION_BASE = {
    1: 0,
    2: 0,
    3: 8200,
    4: 10900,
    5: 13100,
    6: 13100,
  };

  // Factores subsidio/contribución por estrato (multiplicador a tarifa base)
  const FACTOR_SUBSIDIO = {
    1: 0.5, // -50%
    2: 0.6, // -40%
    3: 1.0, // 0%
    4: 1.05, // +5%
    5: 1.2, // +20%
    6: 1.2, // +20%
  };

  const estrato = Math.min(Math.max(i.estrato, 1), 6);
  let consumo = i.consumo_kwh || 250;
  consumo = Math.max(0, Math.min(consumo, 5000));

  // Aplicar restricción horaria si está activada
  let consumo_final = consumo;
  if (i.aplicar_restriccion && i.porcentaje_punta) {
    const pct_punta = Math.min(Math.max(i.porcentaje_punta || 0, 0), 100) / 100;
    const consumo_punta = consumo * pct_punta;
    const consumo_valle = consumo * (1 - pct_punta);

    // Punta: +18%, Valle: -15%
    const tarifa_base = TARIFA_GENERACION + TARIFA_TRANSMISION + TARIFA_DISTRIBUCION + TARIFA_COMERCIALIZACION;
    const tarifa_punta = tarifa_base * 1.18;
    const tarifa_valle = tarifa_base * 0.85;

    const subtotal_punta = consumo_punta * tarifa_punta;
    const subtotal_valle = consumo_valle * tarifa_valle;
    consumo_final = (subtotal_punta + subtotal_valle) / tarifa_base; // normalizar a consumo equivalente
  }

  // Cálculo componentes por kWh
  const generacion_kwh = Math.round(TARIFA_GENERACION * consumo_final);
  const transmision_kwh = Math.round(TARIFA_TRANSMISION * consumo_final);
  const distribucion_kwh = Math.round(TARIFA_DISTRIBUCION * consumo_final);
  const comercializacion_kwh = Math.round(TARIFA_COMERCIALIZACION * consumo_final);

  // Subtotal antes de subsidio/contribución
  const subtotal_base = generacion_kwh + transmision_kwh + distribucion_kwh + comercializacion_kwh;

  // Aplicar factor subsidio/contribución
  const factor = FACTOR_SUBSIDIO[estrato as keyof typeof FACTOR_SUBSIDIO] || 1.0;
  const subtotal_ajustado = Math.round(subtotal_base * factor);
  const contribucion_subsidio = subtotal_ajustado - subtotal_base;

  // Cargos fijos
  const alumbrado_publico = ALUMBRADO_PUBLICO_BASE[estrato as keyof typeof ALUMBRADO_PUBLICO_BASE] || 18500;
  const aseo_contribucion = ASEO_CONTRIBUCION_BASE[estrato as keyof typeof ASEO_CONTRIBUCION_BASE] || 8200;

  // Total recibo
  const total_recibo = subtotal_ajustado + alumbrado_publico + aseo_contribucion;

  // Tarifa media y consumo anual
  const promedio_kwh = consumo > 0 ? Math.round((total_recibo / consumo) * 100) / 100 : 0;
  const anual_estimado = Math.round(total_recibo * 12);

  return {
    generacion_kwh,
    transmision_kwh,
    distribucion_kwh,
    comercializacion_kwh,
    contribucion_subsidio,
    subtotal_kwh: subtotal_ajustado,
    alumbrado_publico,
    aseo_contribucion,
    total_recibo,
    promedio_kwh,
    anual_estimado,
  };
}
