/** Jaula ideal para periquitos según cantidad y tiempo fuera. */
export interface Inputs {
  cantidad?: number;
  largoActual?: number;
  anchoActual?: number;
  altoActual?: number;
  tiempoFueraHoras?: number;
}
export interface Outputs {
  largoMinCm: number;
  anchoMinCm: number;
  altoMinCm: number;
  separacionBarrotesMm: string;
  perchasSugeridas: string;
  cumpleMinimo: string;
}

export function jaulaIdealPeriquito(i: Inputs): Outputs {
  const cant = Math.max(1, Math.round(Number(i.cantidad ?? 1)));
  const largo = Number(i.largoActual ?? 60);
  const ancho = Number(i.anchoActual ?? 40);
  const alto = Number(i.altoActual ?? 50);
  const fueraHoras = Math.max(0, Number(i.tiempoFueraHoras ?? 0));

  let largoMin = 60, anchoMin = 40, altoMin = 40;
  if (cant === 2) { largoMin = 80; anchoMin = 45; altoMin = 45; }
  else if (cant <= 4) { largoMin = 100; anchoMin = 50; altoMin = 50; }
  else if (cant <= 6) { largoMin = 120; anchoMin = 60; altoMin = 60; }
  else { largoMin = 150; anchoMin = 80; altoMin = 120; }

  // Si tiene mucho vuelo libre diario, aceptar -10%
  if (fueraHoras >= 3) { largoMin = Math.round(largoMin * 0.9); anchoMin = Math.round(anchoMin * 0.9); }

  const cumpleLargo = largo >= largoMin;
  const cumpleAncho = ancho >= anchoMin;
  const cumpleAlto = alto >= altoMin;

  let cumple = '';
  if (cumpleLargo && cumpleAncho && cumpleAlto) {
    cumple = 'Sí, cumple el mínimo recomendado. Sumá perchas naturales y vuelo libre diario.';
  } else {
    const faltantes: string[] = [];
    if (!cumpleLargo) faltantes.push(`largo (faltan ${largoMin - largo} cm)`);
    if (!cumpleAncho) faltantes.push(`ancho (faltan ${anchoMin - ancho} cm)`);
    if (!cumpleAlto) faltantes.push(`alto (faltan ${altoMin - alto} cm)`);
    cumple = `No — faltan: ${faltantes.join(', ')}.`;
  }

  const perchas = cant === 1
    ? '3 perchas de madera natural con distinto diámetro (12-18 mm). Evitar plástico liso.'
    : cant <= 2
      ? '4-5 perchas de madera natural con distintos diámetros. Una de cemento/arena para limar garras.'
      : 'Una percha cada dos aves, mix de diámetros y materiales. Zona alta de descanso y zona baja para comer.';

  return {
    largoMinCm: largoMin,
    anchoMinCm: anchoMin,
    altoMinCm: altoMin,
    separacionBarrotesMm: '10-12 mm (menos atrapa patas, más permite escape)',
    perchasSugeridas: perchas,
    cumpleMinimo: cumple,
  };
}
