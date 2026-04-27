export interface Inputs {
  nivelActual: string;
  horasSemanales: number;
  calidadEstudio: string;
}

export interface Outputs {
  mesesEstimados: number;
  horasTotalesRestantes: number;
  desglosePorNivel: string;
  advertencia: string;
}

// Horas brutas de instrucción efectiva por tramo CEFR
// Fuente: Council of Europe / Cambridge Assessment English
const HORAS_BRUTAS_POR_TRAMO: Record<string, number> = {
  "A1_A2": 150,
  "A2_B1": 200,
  "B1_B2": 200,
  "B2_C1": 200,
};

// Tramos necesarios desde cada nivel hasta C1
const TRAMOS_HASTA_C1: Record<string, string[]> = {
  A1: ["A1_A2", "A2_B1", "B1_B2", "B2_C1"],
  A2: ["A2_B1", "B1_B2", "B2_C1"],
  B1: ["B1_B2", "B2_C1"],
  B2: ["B2_C1"],
  C1: [],
};

// Multiplicador de calidad: refleja eficiencia real del estudio
// Alta (inmersión/tutor): 1.0x — Media (clases+práctica): 1.35x — Baja (casual): 1.75x
const MULTIPLICADOR_CALIDAD: Record<string, number> = {
  alta: 1.0,
  media: 1.35,
  baja: 1.75,
};

const SEMANAS_POR_MES = 4.33;

export function compute(i: Inputs): Outputs {
  const nivel = (i.nivelActual ?? "B1").toString().trim().toUpperCase() as keyof typeof TRAMOS_HASTA_C1;
  const horasSemanales = Number(i.horasSemanales) || 0;
  const calidad = (i.calidadEstudio ?? "media").toString().trim().toLowerCase();

  // Validar nivel
  const tramosRestantes = TRAMOS_HASTA_C1[nivel] ?? null;
  if (tramosRestantes === null) {
    return {
      mesesEstimados: 0,
      horasTotalesRestantes: 0,
      desglosePorNivel: "",
      advertencia: "Nivel no reconocido. Seleccioná entre A1, A2, B1, B2 o C1.",
    };
  }

  // Ya en C1
  if (tramosRestantes.length === 0) {
    return {
      mesesEstimados: 0,
      horasTotalesRestantes: 0,
      desglosePorNivel: "Ya alcanzaste el nivel C1.",
      advertencia: "Para estimar el camino a C2, el tramo C1→C2 requiere aproximadamente otras 200 horas efectivas.",
    };
  }

  // Validar horas
  if (horasSemanales <= 0) {
    return {
      mesesEstimados: 0,
      horasTotalesRestantes: 0,
      desglosePorNivel: "",
      advertencia: "Ingresá un número de horas semanales mayor a 0.",
    };
  }

  const multiplicador = MULTIPLICADOR_CALIDAD[calidad] ?? 1.35;

  // Calcular horas brutas restantes y desglose
  let horasBrutasTotal = 0;
  const lineasDesglose: string[] = [];

  for (const tramo of tramosRestantes) {
    const horasBrutas = HORAS_BRUTAS_POR_TRAMO[tramo] ?? 0;
    const horasEfectivas = Math.round(horasBrutas * multiplicador);
    horasBrutasTotal += horasBrutas;
    const etiqueta = tramo.replace("_", " → ");
    lineasDesglose.push(`${etiqueta}: ${horasEfectivas} h efectivas`);
  }

  const horasTotalesRestantes = Math.round(horasBrutasTotal * multiplicador);
  const semanas = horasTotalesRestantes / horasSemanales;
  const mesesEstimados = Math.round((semanas / SEMANAS_POR_MES) * 10) / 10;

  const desglosePorNivel = lineasDesglose.join(" | ");

  let advertencia = "";
  if (calidad === "baja") {
    advertencia = "Con estudio casual el progreso real puede ser aún más lento. Considerá aumentar la calidad de tu práctica.";
  } else if (horasSemanales < 3) {
    advertencia = "Con menos de 3 h/semana el avance es muy lento y el olvido puede contrarrestar el aprendizaje.";
  } else if (mesesEstimados > 60) {
    advertencia = "El tiempo estimado supera los 5 años. Aumentar las horas semanales o la calidad del estudio reducirá considerablemente este plazo.";
  }

  return {
    mesesEstimados,
    horasTotalesRestantes,
    desglosePorNivel,
    advertencia,
  };
}
