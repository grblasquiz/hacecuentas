/** Zonas de FC para entrenamiento — Fórmula Karvonen */
export interface Inputs {
  edad: number;
  fcReposo: number;
}
export interface Outputs {
  fcMaxima: number;
  zona1Min: number; zona1Max: number;
  zona2Min: number; zona2Max: number;
  zona3Min: number; zona3Max: number;
  zona4Min: number; zona4Max: number;
  zona5Min: number; zona5Max: number;
  mensaje: string;
}

export function frecuenciaCardiacaEntrenamiento(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const fcReposo = Number(i.fcReposo) || 60;
  if (!edad || edad < 10 || edad > 100) throw new Error('Ingresá una edad válida');

  // FC máxima estimada (Tanaka 2001): 208 - 0.7 × edad
  const fcMaxima = 208 - 0.7 * edad;

  // Karvonen: FCobjetivo = FCreposo + % × (FCmax - FCreposo)
  const reserva = fcMaxima - fcReposo;

  const zona = (min: number, max: number) => ({
    min: Math.round(fcReposo + min * reserva),
    max: Math.round(fcReposo + max * reserva),
  });

  const z1 = zona(0.50, 0.60); // Recuperación
  const z2 = zona(0.60, 0.70); // Base aeróbica
  const z3 = zona(0.70, 0.80); // Aeróbico / tempo
  const z4 = zona(0.80, 0.90); // Umbral anaeróbico
  const z5 = zona(0.90, 1.00); // VO2max

  return {
    fcMaxima: Math.round(fcMaxima),
    zona1Min: z1.min, zona1Max: z1.max,
    zona2Min: z2.min, zona2Max: z2.max,
    zona3Min: z3.min, zona3Max: z3.max,
    zona4Min: z4.min, zona4Max: z4.max,
    zona5Min: z5.min, zona5Max: z5.max,
    mensaje: `FC máxima: ${Math.round(fcMaxima)} bpm. Zona quema grasa: ${z2.min}–${z2.max} bpm. Zona cardio: ${z3.min}–${z3.max} bpm.`,
  };
}
