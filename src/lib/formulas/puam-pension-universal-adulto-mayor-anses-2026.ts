export interface Inputs {
  edad: number;
  anios_cotizacion: number;
  situacion_residencia: string;
  situacion_cotizacion: string;
  genero: string;
}

export interface Outputs {
  monto_puam_mensual: number;
  porcentaje_haber_minimo: number;
  elegible: string;
  requisitos_detalle: string;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 - ANSES actualización mensual
  const HABER_MINIMO_2026 = 273750; // ARS, estimado abril 2026
  const PORCENTAJE_PUAM = 0.80;
  const EDAD_MINIMA = 65;
  const ANIOS_APORTES_MINIMOS_JUBILACION = 30;
  const ANIOS_RESIDENCIA_PERMANENTE = 2;
  const MESES_SIN_APORTES_MINIMO = 24; // 2 años

  // Validar y convertir inputs
  const edad = Number(i.edad) || 0;
  const anios_cotizacion = Number(i.anios_cotizacion) || 0;
  const situacion_residencia = String(i.situacion_residencia) || "residente_permanente";
  const situacion_cotizacion = String(i.situacion_cotizacion) || "sin_aportes_recientes";

  // Calcular monto base PUAM
  const monto_puam = HABER_MINIMO_2026 * PORCENTAJE_PUAM;
  const porcentaje = PORCENTAJE_PUAM * 100;

  // Validar requisitos
  let elegible_edad = false;
  let elegible_residencia = false;
  let elegible_cotizacion = false;
  let requisitos = [];

  // Requisito 1: Edad
  if (edad >= EDAD_MINIMA) {
    elegible_edad = true;
    requisitos.push(`✓ Edad: ${edad} años (≥${EDAD_MINIMA})`);
  } else {
    requisitos.push(`✗ Edad: ${edad} años (mínimo ${EDAD_MINIMA})`);
  }

  // Requisito 2: Residencia
  if (situacion_residencia === "ciudadano_nativo") {
    elegible_residencia = true;
    requisitos.push("✓ Residencia: Ciudadano nativo argentino");
  } else if (situacion_residencia === "residente_permanente") {
    elegible_residencia = true;
    requisitos.push("✓ Residencia: Residente permanente (≥2 años en Argentina)");
  } else if (situacion_residencia === "residente_temporal") {
    elegible_residencia = false;
    requisitos.push("✗ Residencia: Residente temporal (debe completar 2 años en Argentina)");
  }

  // Requisito 3: Cotización (< 30 años para PUAM)
  if (anios_cotizacion < ANIOS_APORTES_MINIMOS_JUBILACION) {
    elegible_cotizacion = true;
    requisitos.push(`✓ Cotización: ${anios_cotizacion} años (< ${ANIOS_APORTES_MINIMOS_JUBILACION} años requeridos para jubilación ordinaria)`);
  } else {
    elegible_cotizacion = false;
    requisitos.push(`✗ Cotización: ${anios_cotizacion} años (≥ ${ANIOS_APORTES_MINIMOS_JUBILACION} años; accedés a jubilación ordinaria)`);
  }

  // Requisito 4: Situación de aportes
  let requisito_aportes_ok = false;
  if (situacion_cotizacion === "sin_aportes_recientes") {
    requisito_aportes_ok = true;
    requisitos.push("✓ Aportes: Sin aportes hace >2 años (apto para PUAM)");
  } else if (situacion_cotizacion === "con_aportes_insuficientes") {
    requisito_aportes_ok = true;
    requisitos.push("✓ Aportes: Con aportes pero insuficientes para jubilación ordinaria (apto para PUAM)");
  } else if (situacion_cotizacion === "en_moratoria") {
    requisito_aportes_ok = true;
    requisitos.push("✓ Aportes: En moratoria de ANSES (podés combinar PUAM + moratoria)");
  }

  // Determinar elegibilidad general
  const es_elegible = elegible_edad && elegible_residencia && elegible_cotizacion && requisito_aportes_ok;
  const texto_elegible = es_elegible ? "Sí, cumplís requisitos para PUAM 2026" : "No cumplís todos los requisitos. Revisá los detalles abajo.";
  const requisitos_detalle = requisitos.join("\n");

  // Recomendación
  let recomendacion = "";
  if (!es_elegible) {
    if (!elegible_edad) {
      recomendacion = `Debés esperar hasta cumplir ${EDAD_MINIMA} años. En ${EDAD_MINIMA - edad} años podés solicitar PUAM.`;
    } else if (!elegible_residencia) {
      recomendacion = "Residencia insuficiente. Completá 2 años de residencia permanente en Argentina, luego solicita PUAM.";
    } else if (!elegible_cotizacion) {
      recomendacion = `Con ${anios_cotizacion} años de aportes, accedés a jubilación ordinaria (~$${HABER_MINIMO_2026.toLocaleString("es-AR")} ARS/mes). No necesitas PUAM. Solicita jubilación directamente.`;
    }
  } else {
    if (anios_cotizacion >= 15 && anios_cotizacion < ANIOS_APORTES_MINIMOS_JUBILACION) {
      recomendacion = `Tenés ${anios_cotizacion} años de aportes. Considerá moratoria de ANSES para llegar a ${ANIOS_APORTES_MINIMOS_JUBILACION} años (jubilación ordinaria ~$${HABER_MINIMO_2026.toLocaleString("es-AR")} ARS). Si no llegas, PUAM te garantiza $${Math.round(monto_puam).toLocaleString("es-AR")} ARS/mes.`;
    } else {
      recomendacion = `Solicita PUAM en tramites.anses.gob.ar. Monto garantizado: $${Math.round(monto_puam).toLocaleString("es-AR")} ARS mensuales. Aprobación típica: 30-60 días. ANSES puede aprobarte de oficio sin trámite.`;
    }
  }

  return {
    monto_puam_mensual: Math.round(monto_puam),
    porcentaje_haber_minimo: porcentaje,
    elegible: texto_elegible,
    requisitos_detalle: requisitos_detalle,
    recomendacion: recomendacion
  };
}
