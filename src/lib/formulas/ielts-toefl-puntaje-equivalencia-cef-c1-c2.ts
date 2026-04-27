export interface Inputs {
  examen: string;
  puntaje: number;
}

export interface Outputs {
  nivelCEFR: string;
  descripcionCEFR: string;
  equivalenciaIELTS: string;
  equivalenciaTOEFL: string;
  equivalenciaCambridge: string;
  equivalenciaDuolingo: string;
  universidades: string;
}

// Tabla de niveles CEFR con rangos por examen
// Fuentes: ETS (2025), British Council (2025), Cambridge Assessment English (2025), Duolingo (2025)
interface CEFRBand {
  nivel: string;
  descripcion: string;
  ieltsMin: number;
  ieltsMax: number;
  ieltsTxt: string;
  toeflMin: number;
  toeflMax: number;
  toeflTxt: string;
  cambridgeMin: number;
  cambridgeMax: number;
  cambridgeTxt: string;
  duolingoMin: number;
  duolingoMax: number;
  duolingoTxt: string;
  universidades: string;
}

const BANDS: CEFRBand[] = [
  {
    nivel: "A1",
    descripcion: "Usuario básico inicial. Comprende y usa expresiones cotidianas muy básicas.",
    ieltsMin: 0, ieltsMax: 0, ieltsTxt: "No disponible",
    toeflMin: 0, toeflMax: 0, toeflTxt: "No disponible",
    cambridgeMin: 80, cambridgeMax: 94, cambridgeTxt: "80–94",
    duolingoMin: 10, duolingoMax: 55, duolingoTxt: "10–55",
    universidades: "No suficiente para estudios universitarios en el exterior."
  },
  {
    nivel: "A2",
    descripcion: "Usuario básico. Comprende frases y vocabulario de uso frecuente.",
    ieltsMin: 0, ieltsMax: 0, ieltsTxt: "No disponible",
    toeflMin: 0, toeflMax: 0, toeflTxt: "No disponible",
    cambridgeMin: 95, cambridgeMax: 101, cambridgeTxt: "95–101",
    duolingoMin: 60, duolingoMax: 75, duolingoTxt: "60–75",
    universidades: "No suficiente para estudios universitarios en el exterior."
  },
  {
    nivel: "B1",
    descripcion: "Usuario independiente. Comprende los puntos principales de temas familiares.",
    ieltsMin: 4.0, ieltsMax: 4.5, ieltsTxt: "4.0–4.5",
    toeflMin: 42, toeflMax: 71, toeflTxt: "42–71",
    cambridgeMin: 102, cambridgeMax: 120, cambridgeTxt: "102–120 (PET)",
    duolingoMin: 80, duolingoMax: 95, duolingoTxt: "80–95",
    universidades: "Cursos de idiomas preparatorios. No suficiente para admisión directa en la mayoría de universidades."
  },
  {
    nivel: "B2",
    descripcion: "Usuario independiente avanzado. Comprende textos complejos sobre temas concretos y abstractos.",
    ieltsMin: 5.0, ieltsMax: 6.0, ieltsTxt: "5.0–6.0",
    toeflMin: 72, toeflMax: 94, toeflTxt: "72–94",
    cambridgeMin: 121, cambridgeMax: 160, cambridgeTxt: "140–160 (FCE)",
    duolingoMin: 100, duolingoMax: 115, duolingoTxt: "100–115",
    universidades: "Muchas universidades de Reino Unido (pregrado), Europa y algunas de EE. UU. Visa de estudiante Schengen."
  },
  {
    nivel: "C1",
    descripcion: "Usuario competente. Comprende textos extensos y exigentes. Se expresa con fluidez y espontaneidad.",
    ieltsMin: 6.5, ieltsMax: 7.5, ieltsTxt: "6.5–7.5",
    toeflMin: 95, toeflMax: 109, toeflTxt: "95–109",
    cambridgeMin: 161, cambridgeMax: 209, cambridgeTxt: "180–209 (CAE)",
    duolingoMin: 120, duolingoMax: 135, duolingoTxt: "120–135",
    universidades: "Universidades top en EE. UU., Reino Unido y Australia (pregrado y posgrado). Profesiones reguladas (medicina, enfermería)."
  },
  {
    nivel: "C2",
    descripcion: "Usuario maestro. Comprende con facilidad prácticamente todo lo que escucha o lee.",
    ieltsMin: 8.0, ieltsMax: 9.0, ieltsTxt: "8.0–9.0",
    toeflMin: 110, toeflMax: 120, toeflTxt: "110–120",
    cambridgeMin: 210, cambridgeMax: 230, cambridgeTxt: "210–230 (CPE)",
    duolingoMin: 140, duolingoMax: 160, duolingoTxt: "140–160",
    universidades: "Cualquier universidad del mundo. Doctorados, programas académicos de alta exigencia, trabajo académico o diplomático."
  }
];

// Normaliza puntaje IELTS a múltiplos de 0.5 entre 0 y 9
function normalizeIELTS(p: number): number {
  const clamped = Math.max(0, Math.min(9, p));
  return Math.round(clamped * 2) / 2;
}

function getBandForIELTS(score: number): CEFRBand | null {
  const s = normalizeIELTS(score);
  if (s === 0) return null;
  for (const band of BANDS) {
    if (band.ieltsMin === 0) continue;
    if (s >= band.ieltsMin && s <= band.ieltsMax) return band;
  }
  // Edge: si es mayor que el máximo del último band que tiene IELTS
  if (s > 7.5) return BANDS[5]; // C2
  return null;
}

function getBandForTOEFL(score: number): CEFRBand | null {
  const s = Math.round(Math.max(0, Math.min(120, score)));
  if (s === 0) return null;
  for (const band of BANDS) {
    if (band.toeflMin === 0) continue;
    if (s >= band.toeflMin && s <= band.toeflMax) return band;
  }
  return null;
}

function getBandForCambridge(score: number): CEFRBand | null {
  const s = Math.round(Math.max(80, Math.min(230, score)));
  for (const band of BANDS) {
    if (s >= band.cambridgeMin && s <= band.cambridgeMax) return band;
  }
  return null;
}

function getBandForDuolingo(score: number): CEFRBand | null {
  const s = Math.round(Math.max(10, Math.min(160, score)));
  for (const band of BANDS) {
    if (s >= band.duolingoMin && s <= band.duolingoMax) return band;
  }
  return null;
}

function notAvailable(txt: string): string {
  return txt === "No disponible" ? "No disponible" : txt;
}

export function compute(i: Inputs): Outputs {
  const examen = String(i.examen || "ielts").trim().toLowerCase();
  const puntaje = Number(i.puntaje);

  if (isNaN(puntaje) || puntaje <= 0) {
    return {
      nivelCEFR: "—",
      descripcionCEFR: "Ingresá un puntaje válido.",
      equivalenciaIELTS: "—",
      equivalenciaTOEFL: "—",
      equivalenciaCambridge: "—",
      equivalenciaDuolingo: "—",
      universidades: "—"
    };
  }

  let band: CEFRBand | null = null;

  switch (examen) {
    case "ielts":
      band = getBandForIELTS(puntaje);
      break;
    case "toefl":
      band = getBandForTOEFL(puntaje);
      break;
    case "cambridge":
      band = getBandForCambridge(puntaje);
      break;
    case "duolingo":
      band = getBandForDuolingo(puntaje);
      break;
    default:
      band = getBandForIELTS(puntaje);
  }

  if (!band) {
    return {
      nivelCEFR: "Fuera de rango",
      descripcionCEFR: "El puntaje ingresado está fuera del rango válido para este examen.",
      equivalenciaIELTS: "—",
      equivalenciaTOEFL: "—",
      equivalenciaCambridge: "—",
      equivalenciaDuolingo: "—",
      universidades: "Verificá el puntaje ingresado."
    };
  }

  // Para el examen de origen, mostrar el puntaje ingresado; para los demás, mostrar el rango equivalente
  const ieltsDisplay = examen === "ielts"
    ? `${normalizeIELTS(puntaje).toFixed(1)} (tu puntaje) — Rango C-scale: ${band.ieltsTxt}`
    : notAvailable(band.ieltsTxt);

  const toeflDisplay = examen === "toefl"
    ? `${Math.round(puntaje)} (tu puntaje) — Rango equivalente: ${band.toeflTxt}`
    : notAvailable(band.toeflTxt);

  const cambridgeDisplay = examen === "cambridge"
    ? `${Math.round(puntaje)} (tu puntaje) — Rango equivalente: ${band.cambridgeTxt}`
    : band.cambridgeTxt;

  const duolingoDisplay = examen === "duolingo"
    ? `${Math.round(puntaje)} (tu puntaje) — Rango equivalente: ${band.duolingoTxt}`
    : band.duolingoTxt;

  return {
    nivelCEFR: band.nivel,
    descripcionCEFR: band.descripcion,
    equivalenciaIELTS: ieltsDisplay,
    equivalenciaTOEFL: toeflDisplay,
    equivalenciaCambridge: cambridgeDisplay,
    equivalenciaDuolingo: duolingoDisplay,
    universidades: band.universidades
  };
}
