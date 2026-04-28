export interface Inputs {
  numero_operaciones: number;
  importe_total_operaciones: number;
  ejercicio_fiscal: string;
  presentado_a_tiempo: string;
  tasa_sancion_estimada: string;
}

export interface Outputs {
  obligacion_presentacion: string;
  umbral_aplicable: number;
  situacion_declarante: string;
  plazo_presentacion: string;
  sancion_minima: number;
  sancion_maxima: number;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Fuente: AEAT - Modelo 347 2026, Art. 209 Ley General Tributaria
  const UMBRAL_AEAT_2026 = 3005.06; // € por cliente/proveedor año natural
  
  const numero_ops = Math.max(0, i.numero_operaciones || 0);
  const importe_total = Math.max(0, i.importe_total_operaciones || 0);
  const ejercicio = i.ejercicio_fiscal || "2026";
  const presentado = i.presentado_a_tiempo || "si";
  const tasa_sancion = i.tasa_sancion_estimada || "leve";
  
  // Determinar obligación
  const importe_promedio = numero_ops > 0 ? importe_total / numero_ops : 0;
  const obligado = numero_ops > 0 && importe_promedio >= UMBRAL_AEAT_2026;
  
  const obligacion_presentacion = obligado
    ? `Sí, ESTÁS OBLIGADO a presentar el Modelo 347 (${numero_ops} cliente(s)/proveedor(es) con operaciones ≥${UMBRAL_AEAT_2026.toFixed(2)}€/año)`
    : `No, NO ESTÁS OBLIGADO (operaciones totales ${importe_total.toFixed(2)}€ con ${numero_ops} contrapartes no alcanzan umbral)`;
  
  // Plazo de presentación
  const ano_presentacion = parseInt(ejercicio) + 1;
  const plazo_presentacion = `Presentación: 1–28 de febrero de ${ano_presentacion}. Prórroga máximo 10 días hábiles si la solicitas ante AEAT.`;
  
  // Cálculo de sanciones (según Ley General Tributaria, art. 209)
  let sancion_minima = 0;
  let sancion_maxima = 0;
  
  if (presentado === "no_presentado") {
    // No presentado
    if (tasa_sancion === "leve") {
      sancion_minima = 200;
      sancion_maxima = 2000;
    } else if (tasa_sancion === "grave") {
      sancion_minima = 2000;
      sancion_maxima = 10000;
    } else if (tasa_sancion === "muy_grave") {
      sancion_minima = 10000;
      sancion_maxima = 20000;
    }
  } else if (presentado === "no") {
    // Presentado fuera de plazo o defectuosamente
    if (tasa_sancion === "leve") {
      sancion_minima = 200;
      sancion_maxima = 2000;
    } else if (tasa_sancion === "grave") {
      sancion_minima = 2000;
      sancion_maxima = 10000;
    } else if (tasa_sancion === "muy_grave") {
      sancion_minima = 10000;
      sancion_maxima = 20000;
    }
  } else {
    // Presentado a tiempo y correctamente
    sancion_minima = 0;
    sancion_maxima = 0;
  }
  
  // Situación del declarante
  let situacion_declarante = "";
  if (obligado) {
    if (presentado === "si") {
      situacion_declarante = `Cumplidor: presentaste Modelo 347 a tiempo (febrero ${ano_presentacion}). No hay sanciones.`;
    } else if (presentado === "no") {
      situacion_declarante = `Incumplidor: presentaste fuera de plazo o con datos incompletos. Sanción estimada ${sancion_minima}€–${sancion_maxima}€ según AEAT.`;
    } else if (presentado === "no_presentado") {
      situacion_declarante = `Incumplidor: NO PRESENTASTE el Modelo 347. Sanción AEAT ${sancion_minima}€–${sancion_maxima}€ (infracción ${tasa_sancion}).`;
    }
  } else {
    situacion_declaracion = "No obligado: operaciones por debajo del umbral. Sin obligación de presentar ni sanciones aplicables.";
  }
  
  // Recomendación
  let recomendacion = "";
  if (obligado && presentado === "no_presentado") {
    recomendacion = `⚠️ ACCIÓN URGENTE: Debes presentar el Modelo 347 cuanto antes. Aunque estés fuera de plazo (febrero ${ano_presentacion}), una presentación voluntaria reduce sanciones. Accede a https://sede.agenciatributaria.gob.es con tu NIF/DNI + cl@ve o certificado. Plazo de prescripción: 4 años desde 1 ene ${ano_presentacion + 1}.`;
  } else if (obligado && presentado === "no") {
    recomendacion = `⚠️ RECTIFICACIÓN: Presenta una declaración sustitutoria dentro de febrero ${ano_presentacion} si aún estás en plazo, o una rectificadora después (procedimiento más lento). Evitarás sanciones graves.`;
  } else if (obligado && presentado === "si") {
    recomendacion = `✅ Cumplidor: Conserva copia de la aceptación de AEAT mínimo 4 años. Ten a mano justificantes de operaciones (facturas, contratos, estados de cuenta).`;
  } else {
    recomendacion = `ℹ️ No obligado por umbral. Aun así, si tienes dudas sobre qué clientes incluir, consulta con tu gestor/asesor. Mantén registro de operaciones >3.000€ para futuras comprobaciones.`;
  }
  
  return {
    obligacion_presentacion,
    umbral_aplicable: UMBRAL_AEAT_2026,
    situacion_declarante,
    plazo_presentacion,
    sancion_minima,
    sancion_maxima,
    recomendacion
  };
}
