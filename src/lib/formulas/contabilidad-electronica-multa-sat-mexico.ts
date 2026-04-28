export interface Inputs {
  tipo_incumplimiento: 'no_presentar_contabilidad' | 'no_enviar_cfdi' | 'cfdi_incompleto' | 'no_xml_completo' | 'retraso_presentacion' | 'no_libro_mayor';
  ingresos_brutos_anual: number;
  meses_retraso: number;
  presenta_regularizacion: 'no' | 'dentro_30' | 'dentro_90' | 'mas_90';
}

export interface Outputs {
  multa_base: number;
  recargo_actualizacion: number;
  total_sin_regularizacion: number;
  descuento_regularizacion: number;
  total_con_regularizacion: number;
  ahorro_regularizacion: number;
  recomendacion: string;
}

export function compute(inputs: Inputs): Outputs {
  // Constantes SAT 2026 - Catálogo de Sanciones
  // Fuente: SAT - Resoluciones Misceláneas Fiscales 2026, CFF Art. 28, 29, 33, 34
  
  const MULTAS_BASE: Record<string, { minimo: number; maximo: number; estandar: number }> = {
    no_presentar_contabilidad: { minimo: 5530, maximo: 22400, estandar: 11050 },
    no_enviar_cfdi: { minimo: 2765, maximo: 11050, estandar: 5530 },
    cfdi_incompleto: { minimo: 1810, maximo: 5530, estandar: 2765 },
    no_xml_completo: { minimo: 2765, maximo: 11050, estandar: 5530 },
    retraso_presentacion: { minimo: 1810, maximo: 5530, estandar: 2210 },
    no_libro_mayor: { minimo: 5530, maximo: 22400, estandar: 11050 }
  };

  // Determinar multa base según ingresos y tipo incumplimiento
  const datosMulta = MULTAS_BASE[inputs.tipo_incumplimiento] || MULTAS_BASE.no_presentar_contabilidad;
  let multa_base: number;

  if (inputs.ingresos_brutos_anual < 500000) {
    multa_base = datosMulta.minimo;
  } else if (inputs.ingresos_brutos_anual < 2000000) {
    multa_base = datosMulta.estandar * 0.8; // 80% para pequeños
  } else if (inputs.ingresos_brutos_anual < 10000000) {
    multa_base = datosMulta.estandar;
  } else {
    multa_base = datosMulta.maximo * 0.95; // 95% del máximo para grandes
  }

  // Ajuste por meses de retraso: incremento 10% por cada mes (máx. 100%)
  const incremento_retraso = Math.min(inputs.meses_retraso * 0.10, 1.0);
  multa_base = multa_base * (1 + incremento_retraso);

  // Cálculo de recargo (5% anual, CFF Art. 21)
  const tasa_recargo_anual = 0.05;
  const meses_fraccion = inputs.meses_retraso / 12;
  const recargo = multa_base * tasa_recargo_anual * meses_fraccion;

  // Cálculo de actualización (tasa SAT 2026 ≈ 0.365% mensual = 4.38% anual)
  // Fuente: Banxico, tasa de referencia actual
  const tasa_actualizacion_mensual = 0.00365;
  const actualizacion = multa_base * (tasa_actualizacion_mensual * inputs.meses_retraso);

  const recargo_actualizacion = Math.round((recargo + actualizacion) * 100) / 100;
  const total_sin_regularizacion = Math.round((multa_base + recargo_actualizacion) * 100) / 100;

  // Cálculo de descuento por regularización voluntaria (CFF Art. 76)
  let descuento_regularizacion = 0;
  let total_con_regularizacion = total_sin_regularizacion;
  let ahorro_regularizacion = 0;

  if (inputs.presenta_regularizacion !== 'no') {
    if (inputs.presenta_regularizacion === 'dentro_30') {
      descuento_regularizacion = 0.30; // 30%
    } else if (inputs.presenta_regularizacion === 'dentro_90') {
      descuento_regularizacion = 0.20; // 20%
    } else if (inputs.presenta_regularizacion === 'mas_90') {
      descuento_regularizacion = 0.10; // 10%
    }

    ahorro_regularizacion = Math.round(total_sin_regularizacion * descuento_regularizacion * 100) / 100;
    total_con_regularizacion = Math.round((total_sin_regularizacion - ahorro_regularizacion) * 100) / 100;
  }

  // Generación de recomendación
  let recomendacion = '';
  
  if (inputs.presenta_regularizacion === 'no') {
    recomendacion = `⚠️ SIN REGULARIZACIÓN: Deberás pagar $${total_sin_regularizacion.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN. Si el SAT inicia auditoría, podrían aplicarse sanciones adicionales. Considera presentar regularización voluntaria para ahorrar hasta 30%.`;
  } else if (inputs.presenta_regularizacion === 'dentro_30') {
    recomendacion = `✅ OPCIÓN RECOMENDADA: Regularización dentro de 30 días obtiene el máximo descuento (30%). Pagarás $${total_con_regularizacion.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN, ahorrando $${ahorro_regularizacion.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN.`;
  } else if (inputs.presenta_regularizacion === 'dentro_90') {
    recomendacion = `✓ ACEPTABLE: Regularización entre 30-90 días reduce 20%. Pagarás $${total_con_regularizacion.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN. Acelera el trámite para evitar que SAT detecte el incumplimiento.`;
  } else {
    recomendacion = `⚠️ TARDÍA: Después de 90 días el descuento es solo 10%. Pagarás $${total_con_regularizacion.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN. Consulta a contador sobre si SAT ya inició auditoría.`;
  }

  // Validación de mínimo legal
  if (multa_base < 1810) {
    multa_base = 1810; // Multa mínima CFF
  }

  return {
    multa_base: Math.round(multa_base * 100) / 100,
    recargo_actualizacion,
    total_sin_regularizacion,
    descuento_regularizacion: Math.round(descuento_regularizacion * 10000) / 100,
    total_con_regularizacion,
    ahorro_regularizacion,
    recomendacion
  };
}
