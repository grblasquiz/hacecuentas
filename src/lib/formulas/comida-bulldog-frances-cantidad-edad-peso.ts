export interface Inputs {
  etapa: string;
  peso: number;
  actividad: string;
  calidad: string;
}

export interface Outputs {
  gramosTotal: number;
  porcion: number;
  cantidadPorciones: number;
  tipoAlimento: string;
  consumoMensual: number;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;

  if (peso <= 0 || peso > 50) {
    return {
      gramosTotal: 0,
      porcion: 0,
      cantidadPorciones: 0,
      tipoAlimento: "",
      consumoMensual: 0,
      detalle: "Ingresá un peso válido (entre 1 y 50 kg).",
    };
  }

  // --- Factores MER por etapa de vida (NRC / WSAVA) ---
  // Fuente: NRC Nutrient Requirements of Dogs, 2006
  const FACTOR_ETAPA: Record<string, number> = {
    cachorro_temprano: 3.0, // 2-4 meses
    cachorro_medio: 2.5,   // 5-8 meses
    cachorro_tardio: 2.0,  // 9-12 meses
    adulto: 1.6,
    senior: 1.4,
  };

  // --- Factores de ajuste por actividad ---
  const FACTOR_ACTIVIDAD: Record<string, number> = {
    bajo: 0.85,
    moderado: 1.0,
    alto: 1.2,
  };

  // --- Densidad energética del balanceado (kcal / 100 g) ---
  const DENSIDAD_KCAL: Record<string, number> = {
    standard: 320,
    premium: 360,
    superpremium: 400,
  };

  // --- Tipo de alimento recomendado por etapa ---
  const TIPO_ALIMENTO: Record<string, string> = {
    cachorro_temprano: "Puppy / Cachorro (fórmula pequeña raza)",
    cachorro_medio: "Puppy / Cachorro (fórmula pequeña raza)",
    cachorro_tardio: "Puppy / Junior (transición a adulto)",
    adulto: "Adult (razas pequeñas o braquicéfalas)",
    senior: "Senior / Mature (razas pequeñas, 7+)",
  };

  // --- Porciones por etapa ---
  const PORCIONES: Record<string, number> = {
    cachorro_temprano: 3,
    cachorro_medio: 3,
    cachorro_tardio: 2,
    adulto: 2,
    senior: 2,
  };

  const factorEtapa = FACTOR_ETAPA[i.etapa] ?? 1.6;
  const factorActividad = FACTOR_ACTIVIDAD[i.actividad] ?? 1.0;
  const densidad = DENSIDAD_KCAL[i.calidad] ?? 360;
  const tipoAlimento = TIPO_ALIMENTO[i.etapa] ?? "Adult";
  const cantidadPorciones = PORCIONES[i.etapa] ?? 2;

  // --- RER: Resting Energy Requirement ---
  // RER (kcal/día) = 70 × peso_kg^0.75
  const rer = 70 * Math.pow(peso, 0.75);

  // --- MER: Maintenance Energy Requirement ---
  // MER (kcal/día) = RER × factor_etapa × factor_actividad
  const mer = rer * factorEtapa * factorActividad;

  // --- Gramos diarios de balanceado ---
  // gramos = (MER / densidad) × 100
  const gramosTotal = Math.round((mer / densidad) * 100);

  // --- Gramos por porción ---
  const porcion = Math.round(gramosTotal / cantidadPorciones);

  // --- Consumo mensual en kg ---
  const consumoMensual = Math.round((gramosTotal * 30) / 1000 * 10) / 10;

  // --- Observaciones contextuales ---
  let detalle = "";

  if (i.etapa === "cachorro_temprano" || i.etapa === "cachorro_medio") {
    detalle = "Los cachorros necesitan 3 comidas diarias. Respetá los horarios y no dejés comida a libre disposición.";
  } else if (i.etapa === "cachorro_tardio") {
    detalle = "Podés pasar de 3 a 2 porciones diarias entre los 9 y 12 meses, de forma gradual.";
  } else if (i.etapa === "adulto") {
    if (peso > 14) {
      detalle = "Tu Bulldog Francés supera los 14 kg típicos de la raza. Consultá con tu veterinario si corresponde calcular sobre el peso ideal.";
    } else {
      detalle = "Dividí la ración en 2 comidas diarias. Evitá el ejercicio intenso justo antes o después de comer.";
    }
  } else if (i.etapa === "senior") {
    detalle = "Los seniors pueden beneficiarse de 2-3 porciones más pequeñas. Considerá un balanceado con soporte articular y renal.";
  }

  if (i.actividad === "alto") {
    detalle += " Nivel de actividad alto: verificá que el perro mantenga condición corporal óptima (no costillas visibles, cintura perceptible).";
  }

  return {
    gramosTotal,
    porcion,
    cantidadPorciones,
    tipoAlimento,
    consumoMensual,
    detalle: detalle.trim(),
  };
}
