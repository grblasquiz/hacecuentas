export interface Inputs {
  piezas: number;
  dificultad: string;
  experiencia: string;
  sesion_horas: number;
}

export interface Outputs {
  horas_min: number;
  horas_max: number;
  horas_promedio: number;
  sesiones_estimadas: number;
  detalle: string;
}

// Piezas por hora según experiencia (dificultad media como base)
const TASA_BASE: Record<string, number> = {
  principiante: 40,
  intermedio: 80,
  avanzado: 140,
};

// Multiplicador de tiempo según dificultad de la imagen
// Valor > 1 significa que tarda más; valor < 1 significa que tarda menos
const MULT_DIFICULTAD: Record<string, number> = {
  facil: 0.70,
  media: 1.00,
  dificil: 1.60,
  experto: 2.80,
};

// Variabilidad personal: el rango cubre ~80% de la distribución de tiempos reales
const FACTOR_MIN = 0.75;
const FACTOR_MAX = 1.40;

export function compute(i: Inputs): Outputs {
  const piezas = Math.round(Number(i.piezas) || 0);
  const dificultad = String(i.dificultad || "media");
  const experiencia = String(i.experiencia || "intermedio");
  const sesion_horas = Math.max(0.5, Number(i.sesion_horas) || 2);

  if (piezas <= 0) {
    return {
      horas_min: 0,
      horas_max: 0,
      horas_promedio: 0,
      sesiones_estimadas: 0,
      detalle: "Ingresá una cantidad de piezas válida (mayor a 0).",
    };
  }

  const tasaBase = TASA_BASE[experiencia] ?? TASA_BASE["intermedio"];
  const multDificultad = MULT_DIFICULTAD[dificultad] ?? MULT_DIFICULTAD["media"];

  // Horas base = piezas / tasa_base * multiplicador_dificultad
  const horas_promedio = parseFloat(((piezas / tasaBase) * multDificultad).toFixed(1));
  const horas_min = parseFloat((horas_promedio * FACTOR_MIN).toFixed(1));
  const horas_max = parseFloat((horas_promedio * FACTOR_MAX).toFixed(1));
  const sesiones_estimadas = parseFloat((horas_promedio / sesion_horas).toFixed(1));

  const etiquetaExp: Record<string, string> = {
    principiante: "principiante",
    intermedio: "intermedio",
    avanzado: "avanzado",
  };
  const etiquetaDif: Record<string, string> = {
    facil: "fácil",
    media: "media",
    dificil: "difícil",
    experto: "experto (monocromo)",
  };

  const detalle =
    `Puzzle de ${piezas} piezas | Imagen ${etiquetaDif[dificultad] ?? dificultad} | ` +
    `Nivel ${etiquetaExp[experiencia] ?? experiencia} | ` +
    `Tasa base: ${tasaBase} piezas/h × factor ${multDificultad} | ` +
    `Rango: ${horas_min}–${horas_max} h | ` +
    `Con sesiones de ${sesion_horas} h necesitás aprox. ${sesiones_estimadas} sesiones.`;

  return {
    horas_min,
    horas_max,
    horas_promedio,
    sesiones_estimadas,
    detalle,
  };
}
