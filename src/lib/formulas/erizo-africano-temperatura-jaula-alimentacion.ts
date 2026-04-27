export interface Inputs {
  peso: number;
  largo_jaula: number;
  ancho_jaula: number;
  temp_ambiente: number;
  condicion: string;
}

export interface Outputs {
  temperatura_ok: string;
  temp_objetivo: string;
  area_m2: number;
  area_ok: string;
  racion_total_g: number;
  racion_catfood_g: number;
  racion_insectos_g: number;
  watts_lampara: string;
  alerta: string;
}

export function compute(i: Inputs): Outputs {
  // --- Validaciones básicas ---
  const peso = Number(i.peso) || 0;
  const largo = Number(i.largo_jaula) || 0;
  const ancho = Number(i.ancho_jaula) || 0;
  const tempAmbiente = Number(i.temp_ambiente);
  const condicion = i.condicion || "normal";

  if (peso <= 0 || largo <= 0 || ancho <= 0) {
    return {
      temperatura_ok: "Ingresá datos válidos",
      temp_objetivo: "",
      area_m2: 0,
      area_ok: "Ingresá dimensiones válidas",
      racion_total_g: 0,
      racion_catfood_g: 0,
      racion_insectos_g: 0,
      watts_lampara: "",
      alerta: "Completá todos los campos con valores mayores a 0.",
    };
  }

  // --- Temperatura objetivo según condición ---
  // Fuente: Hedgehog Welfare Society; Merck Veterinary Manual 2023
  let tempMin: number;
  let tempMax: number;
  let tempObjetivoLabel: string;

  if (condicion === "gestante") {
    tempMin = 26;
    tempMax = 28;
    tempObjetivoLabel = "26–28 °C (gestante/lactante)";
  } else if (condicion === "juvenil") {
    tempMin = 25;
    tempMax = 27;
    tempObjetivoLabel = "25–27 °C (juvenil)";
  } else {
    // normal / adulto
    tempMin = 24;
    tempMax = 27;
    tempObjetivoLabel = "24–27 °C (adulto sano)";
  }

  const tempMedia = (tempMin + tempMax) / 2;

  // Estado de temperatura
  let temperaturaOk: string;
  if (tempAmbiente < 20) {
    temperaturaOk = "⚠️ PELIGRO: temperatura demasiado baja (riesgo de torpor)";
  } else if (tempAmbiente < tempMin) {
    temperaturaOk = `🔶 Baja: necesitás calefacción para llegar a ${tempMin}°C`;
  } else if (tempAmbiente > 32) {
    temperaturaOk = "⚠️ PELIGRO: temperatura demasiado alta (riesgo de golpe de calor)";
  } else if (tempAmbiente > tempMax) {
    temperaturaOk = `🔶 Alta: considerá ventilación para bajar a ${tempMax}°C`;
  } else {
    temperaturaOk = `✅ Correcta (${tempAmbiente}°C dentro del rango ${tempMin}–${tempMax}°C)`;
  }

  // --- Área de jaula ---
  // Área mínima recomendada: 0.50 m² absoluto, 0.70 m² ideal
  const AREA_MINIMA = 0.50; // m²
  const AREA_IDEAL = 0.70;  // m²
  const areaMq = (largo * ancho) / 10000; // cm² → m²

  let areaOk: string;
  if (areaMq < AREA_MINIMA) {
    areaOk = `❌ Insuficiente — mínimo absoluto: ${AREA_MINIMA} m² (actual: ${areaMq.toFixed(2)} m²)`;
  } else if (areaMq < AREA_IDEAL) {
    areaOk = `🔶 Aceptable, pero se recomienda al menos ${AREA_IDEAL} m²`;
  } else {
    areaOk = `✅ Espacio adecuado (${areaMq.toFixed(2)} m²)`;
  }

  // --- Ración diaria ---
  // Porcentaje del peso corporal según condición
  // Fuente: Susan Brown DVM; Merck Veterinary Manual
  let porcentajeRacion: number;
  if (condicion === "gestante") {
    porcentajeRacion = 0.08; // 8%
  } else if (condicion === "juvenil") {
    porcentajeRacion = 0.075; // 7.5% (promedio 7-8%)
  } else {
    porcentajeRacion = 0.055; // 5.5% (promedio 5-6%)
  }

  const PROPORCION_CATFOOD = 0.70;
  const PROPORCION_INSECTOS = 0.30;

  const racionTotal = peso * porcentajeRacion;
  const racionCatfood = racionTotal * PROPORCION_CATFOOD;
  const racionInsectos = racionTotal * PROPORCION_INSECTOS;

  // --- Lámpara cerámica ---
  // Delta entre temperatura objetivo media y temperatura ambiente
  const deltaT = tempMedia - tempAmbiente;

  let wattsLampara: string;
  if (deltaT <= 0) {
    wattsLampara = "No se necesita calefacción adicional con esta temperatura ambiente";
  } else if (deltaT <= 3) {
    wattsLampara = "25–40 W";
  } else if (deltaT <= 8) {
    wattsLampara = "40–60 W";
  } else {
    wattsLampara = "60–100 W (usar termostato obligatorio)";
  }

  // --- Alertas adicionales ---
  const alertas: string[] = [];

  if (tempAmbiente < 20) {
    alertas.push("🚨 Temperatura crítica: riesgo real de torpor. Calentá al erizo con las manos y consultá al veterinario si no responde.");
  }
  if (tempAmbiente > 32) {
    alertas.push("🚨 Temperatura crítica: riesgo de hipertermia. Ventilá el ambiente y contactá al veterinario.");
  }
  if (areaMq < AREA_MINIMA) {
    alertas.push("🏠 La jaula es demasiado pequeña. El erizo necesita espacio para correr (puede recorrer hasta 5 km por noche).");
  }
  if (peso < 200) {
    alertas.push("⚖️ Peso muy bajo: un erizo adulto sano pesa entre 250-600 g. Consultá un veterinario.");
  }
  if (peso > 700) {
    alertas.push("⚖️ Peso elevado: puede haber obesidad. Reducí cat food y aumentá el espacio de ejercicio.");
  }
  if (deltaT > 8 && tempAmbiente < 16) {
    alertas.push("💡 Diferencia de temperatura muy grande: considerá también mejorar el aislamiento de la jaula además de la lámpara.");
  }

  const alertaFinal = alertas.length > 0 ? alertas.join(" | ") : "Sin alertas críticas.";

  return {
    temperatura_ok: temperaturaOk,
    temp_objetivo: tempObjetivoLabel,
    area_m2: Math.round(areaMq * 100) / 100,
    area_ok: areaOk,
    racion_total_g: Math.round(racionTotal * 10) / 10,
    racion_catfood_g: Math.round(racionCatfood * 10) / 10,
    racion_insectos_g: Math.round(racionInsectos * 10) / 10,
    watts_lampara: wattsLampara,
    alerta: alertaFinal,
  };
}
