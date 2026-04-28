export interface Inputs {
  capital_invertido: number;
  edad_actual: number;
  tasa_rendimiento_anual: number;
  tramo_base_irpf: number;
}

export interface Outputs {
  renta_bruta_mensual: number;
  renta_bruta_anual: number;
  exension_patrimonial_euros: number;
  rendimiento_anual_exento: number;
  rendimiento_anual_tributable: number;
  irpf_reducido_por_edad: number;
  irpf_pagado_anual: number;
  renta_neta_mensual: number;
  renta_neta_anual: number;
  tasa_efectiva_irpf: number;
  nota_fiscalidad: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes AEAT 2026 España
  const LIMITE_EXENSION_PATRIMONIAL_EUR = 240000; // Límite máximo exención ganancia patrimonial por renta vitalicia
  
  // Determinar tipo reducido IRPF según edad (AEAT 2026)
  let tipo_irpf_reducido: number;
  if (i.edad_actual >= 80) {
    tipo_irpf_reducido = 8; // Mayores de 80 años: 8%
  } else if (i.edad_actual >= 70 && i.edad_actual < 80) {
    tipo_irpf_reducido = 20; // 70-79 años: 20%
  } else if (i.edad_actual >= 65 && i.edad_actual < 70) {
    tipo_irpf_reducido = 24; // 65-69 años: 24%
  } else {
    tipo_irpf_reducido = i.tramo_base_irpf; // Si <65, aplica tramo general (no debería ocurrir en esta calculadora)
  }
  
  // Paso 1: Calcular rendimiento bruto anual
  const rendimiento_bruto_anual = (i.capital_invertido * i.tasa_rendimiento_anual) / 100;
  
  // Paso 2: Aplicar exención de ganancia patrimonial
  // La exención se aplica al capital hasta 240.000€
  const capital_exento = Math.min(i.capital_invertido, LIMITE_EXENSION_PATRIMONIAL_EUR);
  const rendimiento_exento = (capital_exento * i.tasa_rendimiento_anual) / 100;
  
  // Rendimiento tributable = rendimiento bruto - rendimiento exento
  const rendimiento_tributable = Math.max(0, rendimiento_bruto_anual - rendimiento_exento);
  
  // Paso 3: Calcular IRPF anual con tipo reducido
  const irpf_anual = (rendimiento_tributable * tipo_irpf_reducido) / 100;
  
  // Paso 4: Calcular renta neta
  const renta_neta_anual = rendimiento_bruto_anual - irpf_anual;
  const renta_neta_mensual = renta_neta_anual / 12;
  const renta_bruta_mensual = rendimiento_bruto_anual / 12;
  
  // Paso 5: Calcular tasa efectiva de IRPF
  const tasa_efectiva_irpf = rendimiento_bruto_anual > 0 ? (irpf_anual / rendimiento_bruto_anual) * 100 : 0;
  
  // Mensaje de nota fiscalidad
  let nota_fiscalidad = "";
  if (i.capital_invertido <= LIMITE_EXENSION_PATRIMONIAL_EUR) {
    nota_fiscalidad = `Capital completamente exento (≤240.000€). Exención vigente AEAT 2026 por reinversión de ganancia patrimonial. Tipo IRPF reducido: ${tipo_irpf_reducido}% (edad ${i.edad_actual} años). Primer año tributa solo rendimiento exento. Desde el 2º año, rendimiento completo tributa al ${tipo_irpf_reducido}%.`;
  } else {
    const capital_no_exento = i.capital_invertido - LIMITE_EXENSION_PATRIMONIAL_EUR;
    nota_fiscalidad = `Capital parcialmente exento: ${LIMITE_EXENSION_PATRIMONIAL_EUR.toLocaleString('es-ES')}€ exentos, ${Math.round(capital_no_exento).toLocaleString('es-ES')}€ no exentos. Tipo IRPF reducido: ${tipo_irpf_reducido}% (edad ${i.edad_actual} años). Primer año: solo capital no exento tributa.`;
  }
  
  return {
    renta_bruta_mensual: Math.round(renta_bruta_mensual * 100) / 100,
    renta_bruta_anual: Math.round(rendimiento_bruto_anual * 100) / 100,
    exension_patrimonial_euros: Math.round(capital_exento * 100) / 100,
    rendimiento_anual_exento: Math.round(rendimiento_exento * 100) / 100,
    rendimiento_anual_tributable: Math.round(rendimiento_tributable * 100) / 100,
    irpf_reducido_por_edad: tipo_irpf_reducido,
    irpf_pagado_anual: Math.round(irpf_anual * 100) / 100,
    renta_neta_mensual: Math.round(renta_neta_mensual * 100) / 100,
    renta_neta_anual: Math.round(renta_neta_anual * 100) / 100,
    tasa_efectiva_irpf: Math.round(tasa_efectiva_irpf * 100) / 100,
    nota_fiscalidad: nota_fiscalidad
  };
}
