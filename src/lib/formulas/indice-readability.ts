/** Índice de legibilidad de un texto — Flesch adaptado español (Fernández Huerta) */
export interface Inputs {
  totalPalabras: number;
  totalOraciones: number;
  totalSilabas: number;
}
export interface Outputs {
  indiceFH: number;
  nivel: string;
  gradoEscolar: string;
  palabrasPorOracion: number;
  silabasPorPalabra: number;
  mensaje: string;
}

export function indiceReadability(i: Inputs): Outputs {
  const palabras = Number(i.totalPalabras);
  const oraciones = Number(i.totalOraciones);
  const silabas = Number(i.totalSilabas);

  if (!palabras || palabras <= 0) throw new Error('Ingresá la cantidad de palabras');
  if (!oraciones || oraciones <= 0) throw new Error('Ingresá la cantidad de oraciones');
  if (!silabas || silabas <= 0) throw new Error('Ingresá la cantidad de sílabas');

  const palabrasPorOracion = palabras / oraciones;
  const silabasPorPalabra = silabas / palabras;

  // Fernández Huerta (1959) — Flesch adaptado al español
  // ILFH = 206.84 - 60 × (sílabas/palabras) - 1.02 × (palabras/oraciones)
  const indiceFH = 206.84 - 60 * silabasPorPalabra - 1.02 * palabrasPorOracion;

  let nivel: string;
  let gradoEscolar: string;
  if (indiceFH >= 90) { nivel = 'Muy fácil'; gradoEscolar = 'Primaria (4to grado)'; }
  else if (indiceFH >= 80) { nivel = 'Fácil'; gradoEscolar = 'Primaria (5to-6to grado)'; }
  else if (indiceFH >= 70) { nivel = 'Bastante fácil'; gradoEscolar = 'Secundaria (1er-2do año)'; }
  else if (indiceFH >= 60) { nivel = 'Normal'; gradoEscolar = 'Secundaria (3er-4to año)'; }
  else if (indiceFH >= 50) { nivel = 'Algo difícil'; gradoEscolar = 'Secundaria (5to año) / universitario'; }
  else if (indiceFH >= 30) { nivel = 'Difícil'; gradoEscolar = 'Universitario / profesional'; }
  else { nivel = 'Muy difícil'; gradoEscolar = 'Posgrado / académico especializado'; }

  return {
    indiceFH: Number(indiceFH.toFixed(1)),
    nivel,
    gradoEscolar,
    palabrasPorOracion: Number(palabrasPorOracion.toFixed(1)),
    silabasPorPalabra: Number(silabasPorPalabra.toFixed(2)),
    mensaje: `Índice Fernández Huerta: ${indiceFH.toFixed(1)} — ${nivel}. Nivel: ${gradoEscolar}. Promedio ${palabrasPorOracion.toFixed(1)} palabras/oración, ${silabasPorPalabra.toFixed(2)} sílabas/palabra.`,
  };
}
