export interface Inputs {
  ubicacion_mancha: string;
  patron_estacional: string;
  aspecto_mancha: string;
  metros_afectados: number;
  metros_lineales: number;
  nivel_deterioro: string;
}

export interface Outputs {
  tipo_humedad: string;
  tratamiento_recomendado: string;
  costo_estimado_min: number;
  costo_estimado_max: number;
  urgencia: string;
  advertencia: string;
}

// Costos de referencia 2026 — CABA/GBA
// Fuente: valores de mercado relevados abril 2026 (mano de obra + materiales básicos)
const COSTO_CAPILARIDAD_MIN_POR_ML = 35000;  // ARS por metro lineal
const COSTO_CAPILARIDAD_MAX_POR_ML = 80000;
const COSTO_FILTRACION_MIN_POR_M2 = 8000;   // ARS por m²
const COSTO_FILTRACION_MAX_POR_M2 = 18000;
const COSTO_CONDENSACION_MIN_POR_M2 = 12000; // ARS por m²
const COSTO_CONDENSACION_MAX_POR_M2 = 30000;

type TipoHumedad = "capilaridad" | "filtracion" | "condensacion" | "indeterminado";

function diagnosticarTipo(
  ubicacion: string,
  patron: string,
  aspecto: string
): TipoHumedad {
  // Lógica de diagnóstico por coincidencia de síntomas
  // Capilaridad: parte baja + invierno sin lluvia + eflorescencias
  const puntosCapilaridad =
    (ubicacion === "bajo_interior" ? 3 : 0) +
    (patron === "invierno_seco" ? 3 : 0) +
    (aspecto === "eflorescencias" ? 2 : 0);

  // Filtración: exterior/lluvia + solo cuando llueve + mancha oscura
  const puntosFiltracion =
    (ubicacion === "exterior_lluvia" ? 3 : 0) +
    (patron === "con_lluvia" ? 3 : 0) +
    (aspecto === "oscura_goteo" ? 2 : 0);

  // Condensación: rincones/techo + invierno con calefacción + hongos negros
  const puntosCondensacion =
    (ubicacion === "rincon_techo" ? 3 : 0) +
    (patron === "invierno_calefaccion" ? 3 : 0) +
    (aspecto === "hongos_negros" ? 2 : 0);

  const maxPuntos = Math.max(puntosCapilaridad, puntosFiltracion, puntosCondensacion);

  if (maxPuntos < 2) return "indeterminado";
  if (puntosCapilaridad === maxPuntos) return "capilaridad";
  if (puntosFiltracion === maxPuntos) return "filtracion";
  return "condensacion";
}

function factorDeterioro(nivel: string): number {
  switch (nivel) {
    case "leve": return 1.0;
    case "moderado": return 1.35;
    case "severo": return 1.80;
    default: return 1.0;
  }
}

export function compute(i: Inputs): Outputs {
  const metros_afectados = Math.max(0, Number(i.metros_afectados) || 0);
  const metros_lineales = Math.max(0, Number(i.metros_lineales) || 4);
  const nivel_deterioro = i.nivel_deterioro || "moderado";

  const tipo = diagnosticarTipo(
    i.ubicacion_mancha || "",
    i.patron_estacional || "",
    i.aspecto_mancha || ""
  );

  const factor = factorDeterioro(nivel_deterioro);

  let tipo_humedad = "";
  let tratamiento_recomendado = "";
  let costo_estimado_min = 0;
  let costo_estimado_max = 0;
  let urgencia = "";
  let advertencia = "";

  if (tipo === "capilaridad") {
    tipo_humedad = "Humedad por capilaridad (ascendente)";
    tratamiento_recomendado =
      "Corte de capa horizontal: inyección de resinas hidrofóbicas (silano-siloxano) o instalación de lámina asfáltica. " +
      "Complementar con mortero de saneamiento HRT en la cara interior.";
    const ml = metros_lineales > 0 ? metros_lineales : 4;
    costo_estimado_min = Math.round(ml * COSTO_CAPILARIDAD_MIN_POR_ML * factor);
    costo_estimado_max = Math.round(ml * COSTO_CAPILARIDAD_MAX_POR_ML * factor);
    urgencia =
      nivel_deterioro === "severo"
        ? "Alta — el avance de sales puede comprometer la estructura del mampuesto"
        : nivel_deterioro === "moderado"
        ? "Media — tratar antes del próximo invierno"
        : "Baja — monitorear y tratar en el corto plazo";
    advertencia =
      "No aplicar hidrofugante superficial sobre muros con capilaridad: puede retener la humedad y agravar el deterioro. " +
      "El costo se calcula por metro lineal de pared (no por m²). Ajustá los metros lineales en el campo correspondiente.";
  } else if (tipo === "filtracion") {
    tipo_humedad = "Humedad por filtración (agua de lluvia)";
    tratamiento_recomendado =
      "Sellado de fisuras con mortero epóxico o poliuretano expansivo + aplicación de hidrofugante en masa o pintura impermeabilizante elastomérica en el exterior. " +
      "En casos severos: revoque hidrófugo completo.";
    const m2 = metros_afectados > 0 ? metros_afectados : 1;
    costo_estimado_min = Math.round(m2 * COSTO_FILTRACION_MIN_POR_M2 * factor);
    costo_estimado_max = Math.round(m2 * COSTO_FILTRACION_MAX_POR_M2 * factor);
    urgencia =
      nivel_deterioro === "severo"
        ? "Alta — las filtraciones continuas deterioran revoques y pueden afectar instalaciones eléctricas"
        : nivel_deterioro === "moderado"
        ? "Media — resolver antes de la temporada de lluvias"
        : "Baja — preventivo, tratar en la próxima temporada seca";
    advertencia =
      "Asegurate de sellar también los bordes de carpinterías (ventanas y puertas) con silicona neutra antes de aplicar el hidrofugante. " +
      "Si el techo o losa está comprometida, el costo es independiente y significativamente mayor.";
  } else if (tipo === "condensacion") {
    tipo_humedad = "Humedad por condensación (vapor interior)";
    tratamiento_recomendado =
      "Mejora del aislamiento térmico de la pared (trasdosado interior con poliestireno + placa de yeso o proyección de poliuretano) + " +
      "incremento de la ventilación del local (ventilación cruzada, extractor mecánico o recuperador de calor).";
    const m2 = metros_afectados > 0 ? metros_afectados : 1;
    costo_estimado_min = Math.round(m2 * COSTO_CONDENSACION_MIN_POR_M2 * factor);
    costo_estimado_max = Math.round(m2 * COSTO_CONDENSACION_MAX_POR_M2 * factor);
    urgencia =
      nivel_deterioro === "severo"
        ? "Alta — presencia de hongos con riesgo para la salud, especialmente en dormitorios de niños"
        : nivel_deterioro === "moderado"
        ? "Media — los hongos se expanden cada invierno sin tratamiento"
        : "Baja — mejorar ventilación como medida preventiva";
    advertencia =
      "Limpiar los hongos existentes con solución de agua oxigenada al 10% antes de aplicar cualquier tratamiento. " +
      "El doble vidriado hermético (DVH) en ventanas complementa la solución pero no reemplaza la mejora de ventilación.";
  } else {
    tipo_humedad = "Diagnóstico indeterminado";
    tratamiento_recomendado =
      "Los síntomas seleccionados no corresponden a un patrón único. " +
      "Revisá las combinaciones o consultá a un profesional para una inspección presencial.";
    costo_estimado_min = 0;
    costo_estimado_max = 0;
    urgencia = "Indeterminada — se requiere inspección profesional";
    advertencia =
      "Los tres tipos de humedad pueden coexistir. Un arquitecto o ingeniero puede usar un higrómetro de pared y una cámara termográfica para un diagnóstico preciso.";
  }

  return {
    tipo_humedad,
    tratamiento_recomendado,
    costo_estimado_min,
    costo_estimado_max,
    urgencia,
    advertencia,
  };
}
