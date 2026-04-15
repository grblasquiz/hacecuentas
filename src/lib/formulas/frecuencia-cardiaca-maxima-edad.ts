/** Frecuencia cardíaca máxima por edad — Tanaka y Fox */
export interface Inputs {
  edad: number;
}
export interface Outputs {
  fcMaxTanaka: number;
  fcMaxFox: number;
  detalle: string;
}

export function frecuenciaCardiacaMaximaEdad(i: Inputs): Outputs {
  const edad = Number(i.edad);
  if (!edad || edad < 10 || edad > 100) throw new Error('Ingresá tu edad (10-100 años)');

  const tanaka = Math.round(208 - 0.7 * edad);
  const fox = Math.round(220 - edad);

  // Zonas de entrenamiento basadas en Tanaka
  const zonas = [
    { nombre: 'Zona 1 (Recuperación)', min: 0.5, max: 0.6 },
    { nombre: 'Zona 2 (Quema de grasa)', min: 0.6, max: 0.7 },
    { nombre: 'Zona 3 (Aeróbico)', min: 0.7, max: 0.8 },
    { nombre: 'Zona 4 (Umbral anaeróbico)', min: 0.8, max: 0.9 },
    { nombre: 'Zona 5 (Máximo)', min: 0.9, max: 1.0 },
  ];

  const zonasTexto = zonas
    .map(
      (z) =>
        `${z.nombre}: ${Math.round(tanaka * z.min)}-${Math.round(tanaka * z.max)} lpm`
    )
    .join(' | ');

  const detalle =
    `FCmax Tanaka: ${tanaka} lpm | FCmax Fox: ${fox} lpm | ` +
    `Zonas (Tanaka): ${zonasTexto}.`;

  return {
    fcMaxTanaka: tanaka,
    fcMaxFox: fox,
    detalle,
  };
}
