export interface Inputs {
  zonas: number;
  direccion: string;
  edad: number;
  bedtime_destino: number;
}

export interface Outputs {
  dosis_mg: number;
  hora_toma: string;
  duracion_dias: string;
  dificultad: string;
  notas: string;
}

/** Redondea al múltiplo de 0.5 más cercano */
function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/** Formatea una hora decimal (0–23.99) en HH:MM */
function formatHour(h: number): string {
  // Asegura rango 0–23
  const normalised = ((h % 24) + 24) % 24;
  const hh = Math.floor(normalised);
  const mm = Math.round((normalised - hh) * 60);
  const hhStr = String(hh).padStart(2, "0");
  const mmStr = String(mm).padStart(2, "0");
  return `${hhStr}:${mmStr}`;
}

export function compute(i: Inputs): Outputs {
  const zonas = Math.max(0, Math.min(12, Math.round(Number(i.zonas) || 0)));
  const direccion = i.direccion === "oeste" ? "oeste" : "este";
  const edad = Math.max(0, Math.min(120, Math.round(Number(i.edad) || 30)));
  const bedtime = Math.max(0, Math.min(23, Math.round(Number(i.bedtime_destino) || 23)));

  if (zonas === 0) {
    return {
      dosis_mg: 0,
      hora_toma: "—",
      duracion_dias: "Sin desfase horario",
      dificultad: "Sin jet lag",
      notas: "No cruzás zonas horarias: no se necesita suplementación con melatonina.",
    };
  }

  // ── Factores de cálculo ──────────────────────────────────────────────────
  // Factor base: zonas cruzadas sobre el máximo práctico (12)
  const factorBase = zonas / 12;

  // Factor dirección: volar al este es ~43% más difícil que al oeste
  // Fuente: Herxheimer & Petrie, Cochrane 2002
  const factorDireccion = direccion === "este" ? 1.0 : 0.7;

  // Factor edad:
  //   < 6 años  → 0.3 (dosis pediátrica muy baja, orientativa)
  //   6–17 años → 0.4
  //   18–54     → 1.0 (producción endógena normal)
  //   ≥ 55      → 1.3 (menor producción pineal)
  // Fuente: Current Neuropharmacology 2017, PMC5405617
  let factorEdad: number;
  if (edad < 6) {
    factorEdad = 0.3;
  } else if (edad < 18) {
    factorEdad = 0.4;
  } else if (edad < 55) {
    factorEdad = 1.0;
  } else {
    factorEdad = 1.3;
  }

  // Dosis: mínimo clínico 0.3 mg + componente variable hasta 2.7 mg adicionales
  // Rango total: 0.3–3.0 mg (evidencia clínica; > 3 mg no añade eficacia)
  const MIN_DOSIS = 0.3;
  const MAX_DOSIS = 5.0; // límite de seguridad OTC
  const dosisRaw = MIN_DOSIS + factorBase * factorDireccion * factorEdad * 2.7;
  const dosisClamped = Math.max(MIN_DOSIS, Math.min(MAX_DOSIS, dosisRaw));
  const dosis_mg = roundToHalf(dosisClamped);

  // ── Hora de toma ─────────────────────────────────────────────────────────
  // 30 minutos antes del bedtime en destino
  const horaTomaDecimal = bedtime - 0.5; // 30 min = 0.5 h
  const hora_toma = formatHour(horaTomaDecimal) + " (hora destino)";

  // ── Duración ─────────────────────────────────────────────────────────────
  // ~1 día por zona hacia el este, ~0.67 días por zona hacia el oeste
  const diasRaw = direccion === "este" ? zonas * 1.0 : zonas * 0.67;
  const dias = Math.max(1, Math.round(diasRaw));
  const duracion_dias = `${dias} noche${dias !== 1 ? "s" : ""}`;

  // ── Nivel de dificultad ──────────────────────────────────────────────────
  const puntuacion = zonas * factorDireccion;
  let dificultad: string;
  if (puntuacion <= 2) {
    dificultad = "Leve (1–2 días de adaptación)";
  } else if (puntuacion <= 5) {
    dificultad = "Moderado (3–5 días de adaptación)";
  } else if (puntuacion <= 8) {
    dificultad = "Alto (6–8 días de adaptación)";
  } else {
    dificultad = "Muy alto (más de 8 días de adaptación)";
  }

  // ── Notas personalizadas ─────────────────────────────────────────────────
  const notasArr: string[] = [];

  if (edad < 6) {
    notasArr.push("⚠️ Menores de 6 años: consultá al pediatra antes de usar melatonina.");
  } else if (edad < 18) {
    notasArr.push("En menores de 18 años la dosis es orientativa; consultá al pediatra.");
  }

  if (edad >= 55) {
    notasArr.push("Adultos mayores de 55: la dosis es algo mayor por menor producción endógena.");
  }

  if (direccion === "este") {
    notasArr.push("Vuelo al este: evitá la luz brillante en las primeras horas de la mañana en destino para potenciar el efecto.");
  } else {
    notasArr.push("Vuelo al oeste: la adaptación es más fácil; podés usar la dosis mínima si los síntomas son leves.");
  }

  if (dosis_mg > 3) {
    notasArr.push("Dosis > 3 mg: considerá hablar con un médico; dosis altas no aumentan la eficacia y pueden causar somnolencia diurna.");
  }

  notasArr.push("Usá melatonina de liberación inmediata. Evitá pantallas 1 hora antes de la toma.");

  const notas = notasArr.join(" | ");

  return {
    dosis_mg,
    hora_toma,
    duracion_dias,
    dificultad,
    notas,
  };
}
