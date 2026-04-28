// Conversor de distancia y velocidad
// Factores exactos según NIST SP 330 e ISO 80000-3:2019

export interface Inputs {
  value: number;
  unit: string;
}

export interface Outputs {
  primary_label: string;
  out_km: number;
  out_mi: number;
  out_m: number;
  out_ft: number;
  out_yd: number;
  out_nmi: number;
  out_kmh: number;
  out_mph: number;
  out_knot: number;
  reference_note: string;
}

// ── Factores de distancia (base: metros) ────────────────────────────────────
const M_PER_KM  = 1000;          // exacto
const M_PER_MI  = 1609.344;      // exacto (acuerdo internacional 1959)
const M_PER_FT  = 0.3048;        // exacto
const M_PER_YD  = 0.9144;        // exacto
const M_PER_NMI = 1852;          // exacto (ICAO)

// ── Factores de velocidad (base: km/h) ──────────────────────────────────────
const KMH_PER_MPH  = 1.609344;   // exacto
const KMH_PER_KNOT = 1.852;      // exacto

const DISTANCE_UNITS = new Set(["km", "mi", "m", "ft", "yd", "nmi"]);
const SPEED_UNITS    = new Set(["kmh", "mph", "knot"]);

/** Convierte metros a todas las unidades de distancia */
function fromMeters(meters: number): {
  out_km: number; out_mi: number; out_m: number;
  out_ft: number; out_yd: number; out_nmi: number;
} {
  return {
    out_m:   meters,
    out_km:  meters / M_PER_KM,
    out_mi:  meters / M_PER_MI,
    out_ft:  meters / M_PER_FT,
    out_yd:  meters / M_PER_YD,
    out_nmi: meters / M_PER_NMI,
  };
}

/** Convierte km/h a todas las unidades de velocidad */
function fromKmh(kmh: number): {
  out_kmh: number; out_mph: number; out_knot: number;
} {
  return {
    out_kmh:  kmh,
    out_mph:  kmh / KMH_PER_MPH,
    out_knot: kmh / KMH_PER_KNOT,
  };
}

/** Genera una nota de referencia práctica según el valor y unidad */
function buildNote(unit: string, value: number, outputs: Outputs): string {
  if (SPEED_UNITS.has(unit)) {
    const kmh = outputs.out_kmh;
    if (kmh > 800 && kmh < 1100) {
      return `Velocidad típica de crucero de un avión comercial narrow-body (~500 kn = 926 km/h).`;
    }
    if (kmh >= 90 && kmh <= 115) {
      return `Rango habitual de autopista en gran parte de LATAM y Europa (90–110 km/h).`;
    }
    if (kmh > 0 && kmh <= 50) {
      return `Velocidad urbana típica (≤50 km/h en zonas residenciales).`;
    }
    return `${outputs.out_mph.toFixed(3)} mph · ${outputs.out_knot.toFixed(3)} kn · ${outputs.out_kmh.toFixed(3)} km/h.`;
  }
  if (DISTANCE_UNITS.has(unit)) {
    const km = outputs.out_km;
    if (km >= 40 && km <= 43) {
      return `Distancia equivalente a un maratón completo (42.195 km = 26.22 mi).`;
    }
    if (km >= 0.099 && km <= 0.101) {
      return `100 m: distancia de la prueba reina del atletismo olímpico.`;
    }
    if (outputs.out_ft >= 34500 && outputs.out_ft <= 35500) {
      return `Altitud de vuelo FL350 (35 000 ft = 10 668 m), nivel de crucero frecuente.`;
    }
    return `${outputs.out_km.toFixed(4)} km · ${outputs.out_mi.toFixed(4)} mi · ${outputs.out_nmi.toFixed(4)} nmi.`;
  }
  return "";
}

const EMPTY_OUTPUTS: Outputs = {
  primary_label: "",
  out_km: 0, out_mi: 0, out_m: 0,
  out_ft: 0, out_yd: 0, out_nmi: 0,
  out_kmh: 0, out_mph: 0, out_knot: 0,
  reference_note: "",
};

export function compute(i: Inputs): Outputs {
  const value = Number(i.value);
  const unit  = (i.unit || "km").trim().toLowerCase();

  if (!Number.isFinite(value) || value < 0) {
    return {
      ...EMPTY_OUTPUTS,
      primary_label: "Ingresa un valor numérico válido y no negativo.",
    };
  }

  let result: Outputs;

  if (DISTANCE_UNITS.has(unit)) {
    // Convertir a metros primero
    let meters = 0;
    switch (unit) {
      case "km":  meters = value * M_PER_KM;  break;
      case "mi":  meters = value * M_PER_MI;  break;
      case "m":   meters = value;              break;
      case "ft":  meters = value * M_PER_FT;  break;
      case "yd":  meters = value * M_PER_YD;  break;
      case "nmi": meters = value * M_PER_NMI; break;
      default:    meters = 0;
    }
    const dist = fromMeters(meters);
    result = {
      primary_label: "Distancia",
      ...dist,
      out_kmh: 0,
      out_mph: 0,
      out_knot: 0,
      reference_note: "",
    };
    result.reference_note = buildNote(unit, value, result);

  } else if (SPEED_UNITS.has(unit)) {
    // Convertir a km/h primero
    let kmh = 0;
    switch (unit) {
      case "kmh":  kmh = value;                    break;
      case "mph":  kmh = value * KMH_PER_MPH;      break;
      case "knot": kmh = value * KMH_PER_KNOT;     break;
      default:     kmh = 0;
    }
    const spd = fromKmh(kmh);
    result = {
      primary_label: "Velocidad",
      out_km: 0, out_mi: 0, out_m: 0,
      out_ft: 0, out_yd: 0, out_nmi: 0,
      ...spd,
      reference_note: "",
    };
    result.reference_note = buildNote(unit, value, result);

  } else {
    return {
      ...EMPTY_OUTPUTS,
      primary_label: "Unidad no reconocida. Selecciona una opción de la lista.",
    };
  }

  return result;
}
