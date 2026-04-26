// Calculadora de Días de Vacaciones por Antigüedad (México)
// Aplica el Art. 76 LFT reformado (DOF 27/12/2022, vigente desde 1/ene/2023)
// y el Art. 80 LFT (prima vacacional mínima 25%).
// Fuente oficial: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf

export interface Inputs {
  aniosAntiguedad: number;
}

export interface Outputs {
  diasVacaciones: number;
  primaVacacional: string;
  detalle: string;
  fundamentoLegal: string;
}

/**
 * Calcula los días de vacaciones que corresponden a un trabajador en México
 * según su antigüedad cumplida, conforme al Art. 76 LFT vigente para 2026.
 *
 * Tabla oficial:
 *   Año 1: 12 días
 *   Año 2: 14 días
 *   Año 3: 16 días
 *   Año 4: 18 días
 *   Año 5: 20 días
 *   Años 6-10: 22 días
 *   Años 11-15: 24 días
 *   Años 16-20: 26 días
 *   ... +2 días por cada 5 años adicionales.
 */
export function vacacionesDiasAntiguedadMexico(inputs: Inputs): Outputs {
  const aniosRaw = Number(inputs.aniosAntiguedad);

  if (!Number.isFinite(aniosRaw) || aniosRaw < 0) {
    throw new Error("Los años de antigüedad deben ser un número mayor o igual a 0.");
  }
  if (aniosRaw > 50) {
    throw new Error("Los años de antigüedad no pueden exceder 50.");
  }

  // Se cuenta solo la antigüedad cumplida (años enteros).
  const anios = Math.floor(aniosRaw);

  let diasVacaciones = 0;
  let detalle = "";

  if (anios < 1) {
    diasVacaciones = 0;
    detalle =
      "Aún no cumples el primer año de servicio. El derecho a vacaciones se adquiere al cumplir el primer aniversario laboral (Art. 76 LFT). En caso de terminación anticipada, te corresponden vacaciones proporcionales en el finiquito.";
  } else if (anios === 1) {
    diasVacaciones = 12;
    detalle = "Primer año de servicio: 12 días (Art. 76 LFT reformado, vigente desde 1/ene/2023).";
  } else if (anios === 2) {
    diasVacaciones = 14;
    detalle = "Segundo año de servicio: 14 días.";
  } else if (anios === 3) {
    diasVacaciones = 16;
    detalle = "Tercer año de servicio: 16 días.";
  } else if (anios === 4) {
    diasVacaciones = 18;
    detalle = "Cuarto año de servicio: 18 días.";
  } else if (anios === 5) {
    diasVacaciones = 20;
    detalle = "Quinto año de servicio: 20 días.";
  } else {
    // Años 6+: base 22 días, +2 por cada 5 años adicionales.
    // Años 6-10 -> 22, 11-15 -> 24, 16-20 -> 26, 21-25 -> 28, etc.
    const quinquenios = Math.floor((anios - 6) / 5);
    diasVacaciones = 22 + quinquenios * 2;
    const inicioRango = 6 + quinquenios * 5;
    const finRango = inicioRango + 4;
    detalle = `Antigüedad de ${anios} años (rango ${inicioRango}-${finRango}): ${diasVacaciones} días de vacaciones según Art. 76 LFT.`;
  }

  // Prima vacacional mínima: 25% sobre los días que correspondan (Art. 80 LFT).
  const equivalenteDias = (diasVacaciones * 0.25).toFixed(2);
  const primaVacacional =
    diasVacaciones > 0
      ? `25% sobre ${diasVacaciones} días = equivalente a ${equivalenteDias} días de salario adicional (Art. 80 LFT).`
      : "Aún no aplica prima vacacional (no se cumple el primer año).";

  const fundamentoLegal =
    "Art. 76 LFT (días de vacaciones por antigüedad) y Art. 80 LFT (prima vacacional mínima del 25%). Reforma publicada en el DOF el 27/12/2022, vigente desde el 1 de enero de 2023.";

  return {
    diasVacaciones,
    primaVacacional,
    detalle,
    fundamentoLegal,
  };
}
