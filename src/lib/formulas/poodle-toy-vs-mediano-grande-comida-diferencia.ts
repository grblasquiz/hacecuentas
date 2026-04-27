export interface Inputs {
  variedad: string;
  peso: number;
  etapa: string;
  actividad: string;
}

export interface Outputs {
  gramos_diarios: number;
  gramos_por_comida: number;
  tomas_recomendadas: number;
  tipo_balanceado: string;
  gramos_mes: number;
  bolsa_kg_mes: string;
  nota: string;
}

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;
  const variedad = i.variedad || "toy";
  const etapa = i.etapa || "adulto";
  const actividad = i.actividad || "moderada";

  // Validaciones básicas
  if (peso <= 0) {
    return {
      gramos_diarios: 0,
      gramos_por_comida: 0,
      tomas_recomendadas: 2,
      tipo_balanceado: "Ingresá un peso válido",
      gramos_mes: 0,
      bolsa_kg_mes: "-",
      nota: "El peso debe ser mayor a 0 kg.",
    };
  }

  // Validar rangos de peso según variedad (advertencia, no bloqueo)
  const RANGOS: Record<string, [number, number]> = {
    toy: [1.5, 5],
    miniatura: [4, 9],
    mediano: [7, 17],
    estandar: [18, 35],
  };

  // Peso metabólico: fórmula NRC 2006
  // EM_basal (kcal/día) = 70 × (peso_kg ^ 0.75)
  const pesoMetabolico = Math.pow(peso, 0.75);
  const emBasal = 70 * pesoMetabolico;

  // Factor de mantenimiento según variedad (razas pequeñas tienen mayor tasa metabólica por kg)
  // Toy/Mini: factor 1.6; Mediano: 1.4; Estándar: 1.2 — basado en NRC ajustes por talla
  const FACTOR_VARIEDAD: Record<string, number> = {
    toy: 1.6,
    miniatura: 1.55,
    mediano: 1.4,
    estandar: 1.2,
  };
  const factorVariedad = FACTOR_VARIEDAD[variedad] ?? 1.4;

  // Factor etapa de vida
  // Cachorro: 2.0x; Adulto: 1.0x; Senior: 0.8x
  const FACTOR_ETAPA: Record<string, number> = {
    cachorro: 2.0,
    adulto: 1.0,
    senior: 0.8,
  };
  const factorEtapa = FACTOR_ETAPA[etapa] ?? 1.0;

  // Factor actividad
  // Baja (sedentario/esterilizado): 0.8x; Moderada: 1.0x; Alta: 1.25x
  const FACTOR_ACTIVIDAD: Record<string, number> = {
    baja: 0.8,
    moderada: 1.0,
    alta: 1.25,
  };
  const factorActividad = FACTOR_ACTIVIDAD[actividad] ?? 1.0;

  // Energía total requerida
  const emTotal = emBasal * factorVariedad * factorEtapa * factorActividad;

  // Densidad energética promedio del balanceado seco (kcal/100g)
  // Fuente: promedio de productos comerciales por segmento de talla
  const DENSIDAD_KCAL_100G: Record<string, number> = {
    toy: 390,       // razas mini: croqueta densa
    miniatura: 380,
    mediano: 370,
    estandar: 355,
  };
  const densidad = DENSIDAD_KCAL_100G[variedad] ?? 370;

  // Gramos diarios = (EM_total / densidad) * 100
  const gramosDiarios = Math.round((emTotal / densidad) * 100);

  // Tomas recomendadas según variedad y etapa
  let tomasRecomendadas: number;
  if (etapa === "cachorro") {
    tomasRecomendadas = variedad === "toy" || variedad === "miniatura" ? 4 : 3;
  } else {
    tomasRecomendadas = 2;
  }

  const gramosPorComida = Math.round(gramosDiarios / tomasRecomendadas);

  // Consumo mensual
  const gramosMes = gramosDiarios * 30;

  // Estimación bolsa mensual
  let bolsaKgMes: string;
  const kgMes = gramosMes / 1000;
  if (kgMes <= 1.5) {
    bolsaKgMes = "1 bolsa de 1,5 kg/mes aprox.";
  } else if (kgMes <= 3) {
    bolsaKgMes = "1 bolsa de 3 kg/mes aprox.";
  } else if (kgMes <= 7.5) {
    bolsaKgMes = "1 bolsa de 7,5 kg/mes aprox.";
  } else if (kgMes <= 15) {
    bolsaKgMes = "1 bolsa de 15 kg/mes aprox.";
  } else {
    bolsaKgMes = `Aprox. ${kgMes.toFixed(1)} kg/mes (bolsa grande o 2 bolsas)`;
  }

  // Tipo de balanceado sugerido
  const TIPO_BALANCEADO: Record<string, Record<string, string>> = {
    toy: {
      cachorro: "Cachorro raza pequeña / mini — croqueta pequeña, alta densidad calórica",
      adulto:   "Adulto raza pequeña / mini — fórmula específica toy o mini",
      senior:   "Senior raza pequeña / mini — bajo en calorías, enriquecido con antioxidantes",
    },
    miniatura: {
      cachorro: "Cachorro raza pequeña — alta proteína y calcio",
      adulto:   "Adulto raza pequeña / miniatura — fórmula equilibrada",
      senior:   "Senior raza pequeña — articulaciones y metabolismo lento",
    },
    mediano: {
      cachorro: "Cachorro raza mediana — croqueta mediana, DHA para desarrollo",
      adulto:   "Adulto raza mediana — mantenimiento estándar",
      senior:   "Senior raza mediana — menor densidad calórica, glucosamina",
    },
    estandar: {
      cachorro: "Cachorro raza grande — fórmula controlada en calcio para crecimiento óseo",
      adulto:   "Adulto raza grande — mantenimiento, articulaciones, croqueta grande",
      senior:   "Senior raza grande — bajo en calorías, soporte articular y renal",
    },
  };
  const tipoBalanceado =
    TIPO_BALANCEADO[variedad]?.[etapa] ??
    "Balanceado completo y balanceado para la etapa de vida del animal";

  // Notas y advertencias
  const notas: string[] = [];

  const [pesoMin, pesoMax] = RANGOS[variedad] ?? [0, 100];
  if (peso < pesoMin) {
    notas.push(`El peso ingresado (${peso} kg) está por debajo del rango típico para la variedad ${variedad} (${pesoMin}-${pesoMax} kg). Verificá la variedad seleccionada.`);
  } else if (peso > pesoMax) {
    notas.push(`El peso ingresado (${peso} kg) está por encima del rango típico para la variedad ${variedad} (${pesoMin}-${pesoMax} kg). Verificá la variedad seleccionada.`);
  }

  if (actividad === "baja") {
    notas.push("Para perros esterilizados, considerá además reducir un 10-15% adicional y elegir fórmula 'sterilized' o 'light'.");
  }
  if (etapa === "cachorro" && (variedad === "toy" || variedad === "miniatura")) {
    notas.push("Cachorros Toy y Miniatura son susceptibles a hipoglucemia: respetá las 3-4 tomas diarias y no dejes pasar más de 6 horas sin alimentarlos.");
  }

  notas.push("Estimación basada en fórmula NRC 2006 y densidad energética promedio de balanceados comerciales. Ajustá según la etiqueta de tu producto y el peso real de tu perro.");

  return {
    gramos_diarios: gramosDiarios,
    gramos_por_comida: gramosPorComida,
    tomas_recomendadas: tomasRecomendadas,
    tipo_balanceado: tipoBalanceado,
    gramos_mes: gramosMes,
    bolsa_kg_mes: bolsaKgMes,
    nota: notas.join(" | "),
  };
}
