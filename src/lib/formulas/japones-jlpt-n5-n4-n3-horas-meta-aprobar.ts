export interface Inputs {
  nivel: string;
  horasActuales: number;
  horasPorSemana: number;
}

export interface Outputs {
  horasRestantes: number;
  semanasRestantes: number;
  mesesRestantes: number;
  anosRestantes: number;
  recursos: string;
  mensaje: string;
}

// Horas acumuladas estimadas desde cero para cada nivel JLPT.
// Fuente: Japan Foundation / comunidad r/LearnJapanese (promedio para hablantes no asiáticos).
const HORAS_OBJETIVO: Record<string, number> = {
  N5: 250,
  N4: 550,
  N3: 1000,
  N2: 1700,
  N1: 3000,
};

const RECURSOS: Record<string, string> = {
  N5: "Genki I, WaniKani niveles 1-10, Bunpro N5, Anki Core 2000.",
  N4: "Genki I y II, WaniKani niveles 1-20, Bunpro N4, Anki Core 2000.",
  N3: "Genki II + Tobira, WaniKani niveles 20-40, Bunpro N3, Anki Core 3000-6000, NHK Web Easy.",
  N2: "Tobira + materiales auténticos, WaniKani 40-55, Bunpro N2, Anki avanzado, lectura extensiva.",
  N1: "Materiales 100% auténticos, WaniKani 55-60, Bunpro N1, Anki frecuencias avanzadas, podcasts y prensa nativa.",
};

// Semanas promedio por mes (365 / 12 / 7)
const SEMANAS_POR_MES = 365 / 12 / 7; // ≈ 4.345

export function compute(i: Inputs): Outputs {
  const nivel = (i.nivel || "N3").toUpperCase();
  const horasActuales = Math.max(0, Number(i.horasActuales) || 0);
  const horasPorSemana = Number(i.horasPorSemana) || 0;

  const horasObjetivo = HORAS_OBJETIVO[nivel];

  if (!horasObjetivo) {
    return {
      horasRestantes: 0,
      semanasRestantes: 0,
      mesesRestantes: 0,
      anosRestantes: 0,
      recursos: "Seleccioná un nivel válido (N5 a N1).",
      mensaje: "Nivel no reconocido.",
    };
  }

  if (horasPorSemana <= 0) {
    return {
      horasRestantes: Math.max(0, horasObjetivo - horasActuales),
      semanasRestantes: 0,
      mesesRestantes: 0,
      anosRestantes: 0,
      recursos: RECURSOS[nivel] || "",
      mensaje: "Ingresá una cantidad de horas semanales mayor a 0 para calcular el tiempo.",
    };
  }

  const horasRestantes = Math.max(0, horasObjetivo - horasActuales);

  if (horasRestantes === 0) {
    return {
      horasRestantes: 0,
      semanasRestantes: 0,
      mesesRestantes: 0,
      anosRestantes: 0,
      recursos: RECURSOS[nivel] || "",
      mensaje: `¡Ya alcanzaste las horas estimadas para el ${nivel} (${horasObjetivo} h)! Revisá los contenidos del examen y buscá la próxima convocatoria en jlpt.jp.`,
    };
  }

  const semanasRestantes = horasRestantes / horasPorSemana;
  const mesesRestantes = semanasRestantes / SEMANAS_POR_MES;
  const anosRestantes = mesesRestantes / 12;

  const mesesRedondeados = Math.round(mesesRestantes * 10) / 10;
  const anosRedondeados = Math.round(anosRestantes * 10) / 10;

  const mensaje =
    `Para el ${nivel} necesitás unas ${horasRestantes} horas más. ` +
    `Estudiando ${horasPorSemana} h/semana, estarás listo/a en aproximadamente ${mesesRedondeados} meses (${anosRedondeados} años). ` +
    `El JLPT se rinde en julio y diciembre; planificá la inscripción con 3-4 meses de anticipación.`;

  return {
    horasRestantes: Math.round(horasRestantes),
    semanasRestantes: Math.round(semanasRestantes),
    mesesRestantes: mesesRedondeados,
    anosRestantes: anosRedondeados,
    recursos: RECURSOS[nivel] || "",
    mensaje,
  };
}
