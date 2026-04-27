export interface Inputs {
  peso: number;
  edad_meses: number;
  actividad: string;
  tipo_alimento: string;
  castrado: string;
}

export interface Outputs {
  gramos_dia: number;
  gramos_por_toma: number;
  frecuencia: number;
  etapa: string;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;
  const edadMeses = Number(i.edad_meses) || 0;

  if (peso <= 0 || peso > 10) {
    return {
      gramos_dia: 0,
      gramos_por_toma: 0,
      frecuencia: 0,
      etapa: "Error",
      recomendacion: "Ingresá un peso válido entre 0.5 y 10 kg.",
    };
  }

  if (edadMeses <= 0 || edadMeses > 240) {
    return {
      gramos_dia: 0,
      gramos_por_toma: 0,
      frecuencia: 0,
      etapa: "Error",
      recomendacion: "Ingresá una edad válida en meses (1-240).",
    };
  }

  // --- Etapa vital ---
  let etapa: string;
  let factorEtapa: number;
  let frecuencia: number;

  if (edadMeses < 4) {
    etapa = "Cachorro (< 4 meses)";
    factorEtapa = 3.0;
    frecuencia = 5;
  } else if (edadMeses < 12) {
    etapa = "Cachorro (4-12 meses)";
    factorEtapa = 2.5;
    frecuencia = 4;
  } else if (edadMeses <= 84) {
    // hasta 7 años
    etapa = "Adulto (1-7 años)";
    factorEtapa = 1.6;
    frecuencia = 2;
  } else {
    etapa = "Senior (> 7 años)";
    factorEtapa = 1.4;
    frecuencia = 2;
  }

  // --- Factor de actividad ---
  let factorActividad: number;
  switch (i.actividad) {
    case "bajo":
      factorActividad = 0.9;
      break;
    case "alto":
      factorActividad = 1.2;
      break;
    default: // normal
      factorActividad = 1.0;
  }

  // --- Factor castrado (esterilizados necesitan ~15% menos calorías) ---
  const factorCastrado = i.castrado === "si" ? 0.85 : 1.0;

  // --- RER: Resting Energy Requirement (NRC 2006) ---
  // RER (kcal/día) = 70 × peso_kg^0.75
  const rer = 70 * Math.pow(peso, 0.75);

  // --- MER: Maintenance Energy Requirement ---
  const mer = rer * factorEtapa * factorActividad * factorCastrado;

  // --- Densidad energética (kcal/kg) por tipo de alimento ---
  // Seco calidad raza toy: ~3500 kcal/kg
  // Húmedo: ~900 kcal/kg
  // Mixto: 60% seco + 40% húmedo en peso → densidad ponderada
  const DENSIDAD_SECO = 3500; // kcal/kg
  const DENSIDAD_HUMEDO = 900; // kcal/kg

  let densidad: number;
  switch (i.tipo_alimento) {
    case "humedo":
      densidad = DENSIDAD_HUMEDO;
      break;
    case "mixto":
      densidad = DENSIDAD_SECO * 0.6 + DENSIDAD_HUMEDO * 0.4;
      break;
    default: // seco
      densidad = DENSIDAD_SECO;
  }

  // Gramos por día = (MER / densidad_kcal_per_kg) × 1000
  const gramosDia = Math.round((mer / densidad) * 1000);
  const gramosPorToma = Math.round(gramosDia / frecuencia);

  // --- Recomendaciones adicionales ---
  const recomendaciones: string[] = [];

  if (edadMeses < 4) {
    recomendaciones.push(
      "⚠️ Riesgo de hipoglucemia: nunca dejes pasar más de 3 horas entre tomas. Ante letargo o temblores, consultá al veterinario de urgencia."
    );
  } else if (edadMeses < 12) {
    recomendaciones.push(
      "Cachorro en crecimiento: distribuí las 4 tomas en horarios regulares para mantener la glucemia estable."
    );
  }

  if (i.tipo_alimento === "seco" || i.tipo_alimento === "mixto") {
    recomendaciones.push(
      "Usá croquetas de diámetro ≤ 8 mm (formulación toy/miniatura) para favorecer la masticación y reducir la acumulación de sarro."
    );
  }

  if (i.castrado === "si") {
    recomendaciones.push(
      "Perro castrado: la porción ya incluye una reducción del 15%. Monitoreá el peso mensualmente para detectar sobrepeso temprano."
    );
  }

  if (etapa.startsWith("Senior")) {
    recomendaciones.push(
      "Senior: considerá un alimento formulado para perros mayores, con menor contenido de fósforo y sodio. Revisión veterinaria anual mínima."
    );
  }

  if (peso < 1.5) {
    recomendaciones.push(
      "Peso muy bajo para la raza: consultá al veterinario para descartar problemas de salud subyacentes."
    );
  } else if (peso > 3.8) {
    recomendaciones.push(
      "Peso por encima del estándar Yorkie (2-3.5 kg): evaluá posible sobrepeso con tu veterinario."
    );
  }

  recomendaciones.push(
    "Estos valores son orientativos. Verificá las kcal/kg en el envase de tu alimento específico y ajustá según la condición corporal del perro."
  );

  return {
    gramos_dia: gramosDia,
    gramos_por_toma: gramosPorToma,
    frecuencia,
    etapa,
    recomendacion: recomendaciones.join(" | "),
  };
}
