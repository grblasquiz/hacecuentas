/** Calculadora de Tensión de Cuerda de Guitarra */
export interface Inputs {
  calibre: number;
  frecuencia: number;
  escala: number;
}
export interface Outputs {
  tensionLbs: number;
  tensionKg: number;
  tensionN: number;
  evaluacion: string;
  _insight?: any;
  _chart?: any;
}

export function cuerdaGuitarraTension(i: Inputs): Outputs {
  const gauge = Number(i.calibre);
  const freq = Number(i.frecuencia);
  const scale = Number(i.escala);

  if (!gauge || gauge <= 0) throw new Error('Ingresá el calibre de la cuerda');
  if (!freq || freq <= 0) throw new Error('Ingresá la frecuencia de afinación');
  if (!scale || scale <= 0) throw new Error('Ingresá la longitud de escala');

  // Unit weight approximation for plain steel strings: UW = gauge^2 * 2241.2 (lbs/inch)
  // For wound strings (gauge > 0.018), different formula
  const isWound = gauge > 0.018;
  const unitWeight = isWound
    ? Math.pow(gauge, 2) * 1607.2  // wound string approximation
    : Math.pow(gauge, 2) * 2241.2; // plain steel

  // Tension formula: T = UW * (2 * L * F)^2
  // where L = scale length in inches, F = frequency in Hz
  // UW in lbs/inch, result in lbs
  const tensionLbs = unitWeight * Math.pow(2 * scale * freq, 2) / 386.4;

  const tensionKg = tensionLbs * 0.4536;
  const tensionN = tensionLbs * 4.4482;

  let evaluacion: string;
  if (tensionLbs < 10) evaluacion = 'Tensión muy baja — la cuerda va a estar floja y zumbar. Subí el calibre o la afinación.';
  else if (tensionLbs < 14) evaluacion = 'Tensión baja — cómoda para bends pero puede sonar débil. Buena para solos.';
  else if (tensionLbs < 18) evaluacion = 'Tensión ideal — buen balance entre comodidad y tono. Rango óptimo.';
  else if (tensionLbs < 22) evaluacion = 'Tensión media-alta — buen sustain y tono completo. Los bends requieren más fuerza.';
  else evaluacion = 'Tensión alta — muy firme, difícil para bends. Buena para ritmo pesado y drop tunings.';

  // --- Insight + gauge ---
  const lbs1 = Number(tensionLbs.toFixed(1));
  const kg1 = Number(tensionKg.toFixed(1));
  let tono: "good" | "warn" | "neutral";
  let etiquetaZona: string;
  if (tensionLbs < 10) {
    tono = "warn";
    etiquetaZona = "muy baja";
  } else if (tensionLbs < 14) {
    tono = "neutral";
    etiquetaZona = "baja";
  } else if (tensionLbs < 18) {
    tono = "good";
    etiquetaZona = "ideal";
  } else if (tensionLbs < 22) {
    tono = "neutral";
    etiquetaZona = "media-alta";
  } else {
    tono = "warn";
    etiquetaZona = "alta";
  }

  const _insight = {
    title: "Tensión de la cuerda",
    text: `Esta cuerda queda con **${lbs1} lbs** (${kg1} kg) de tensión, una zona **${etiquetaZona}**. ${
      tono === "good"
        ? "Buen balance entre comodidad y tono."
        : tono === "warn"
          ? "Conviene ajustar calibre, afinación o escala para llevarla a un rango más cómodo."
          : "Es usable; el tacto y el sustain van a depender de tu estilo."
    }`,
    tone: tono,
    icon: "🎸",
  };

  const _chart = {
    type: "scale",
    marker: lbs1,
    markerLabel: lbs1 + " lbs",
    min: 0,
    segments: [
      { nombre: "Muy baja", max: 10, color: "#ef4444", colorDark: "#b91c1c" },
      { nombre: "Baja", max: 14, color: "#f59e0b", colorDark: "#b45309" },
      { nombre: "Ideal", max: 18, color: "#22c55e", colorDark: "#15803d" },
      { nombre: "Media-alta", max: 22, color: "#f59e0b", colorDark: "#b45309" },
      {
        nombre: "Alta",
        max: Math.max(26, Math.ceil(lbs1) + 2),
        color: "#ef4444",
        colorDark: "#b91c1c",
      },
    ],
    ariaLabel: `Tensión de ${lbs1} libras ubicada en la zona ${etiquetaZona} (muy baja, baja, ideal, media-alta o alta).`,
  };

  return {
    tensionLbs: Number(tensionLbs.toFixed(1)),
    tensionKg: Number(tensionKg.toFixed(1)),
    tensionN: Number(tensionN.toFixed(1)),
    evaluacion,
    _insight,
    _chart,
  };
}
