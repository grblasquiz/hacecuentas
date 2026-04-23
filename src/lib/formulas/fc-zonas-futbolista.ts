/** Zonas de frecuencia cardíaca para entrenamiento de futbolistas (Tanaka 2001) */
export interface Inputs {
  edad: number;
  fcReposo?: number; // opcional - si viene usa Karvonen
}

export interface Outputs {
  fcMax: number;
  z1Min: number; z1Max: number;
  z2Min: number; z2Max: number;
  z3Min: number; z3Max: number;
  z4Min: number; z4Max: number;
  z5Min: number; z5Max: number;
  metodo: string;
  detalle: string;
}

const ZONAS = [
  { n: 1, min: 0.50, max: 0.60, desc: 'Recuperación activa' },
  { n: 2, min: 0.60, max: 0.70, desc: 'Aeróbico base' },
  { n: 3, min: 0.70, max: 0.80, desc: 'Aeróbico de desarrollo' },
  { n: 4, min: 0.80, max: 0.90, desc: 'Umbral anaeróbico' },
  { n: 5, min: 0.90, max: 1.00, desc: 'VO2max / máximo' },
];

export function fcZonasFutbolista(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const fcRep = Number(i.fcReposo);

  if (!edad || edad < 8 || edad > 90) throw new Error('Ingresá una edad válida (8-90)');

  // Tanaka (2001): FCmax = 207 - 0.7 × edad
  const fcMax = Math.round(207 - 0.7 * edad);

  let metodo = 'Tanaka (% FCmax)';
  const zonas: { min: number; max: number }[] = [];

  if (fcRep && fcRep > 30 && fcRep < 100) {
    // Karvonen: FC objetivo = FCreserva × % + FCreposo
    metodo = 'Karvonen (% FC de reserva)';
    const fcReserva = fcMax - fcRep;
    ZONAS.forEach(z => {
      zonas.push({
        min: Math.round(fcReserva * z.min + fcRep),
        max: Math.round(fcReserva * z.max + fcRep),
      });
    });
  } else {
    ZONAS.forEach(z => {
      zonas.push({
        min: Math.round(fcMax * z.min),
        max: Math.round(fcMax * z.max),
      });
    });
  }

  return {
    fcMax,
    z1Min: zonas[0].min, z1Max: zonas[0].max,
    z2Min: zonas[1].min, z2Max: zonas[1].max,
    z3Min: zonas[2].min, z3Max: zonas[2].max,
    z4Min: zonas[3].min, z4Max: zonas[3].max,
    z5Min: zonas[4].min, z5Max: zonas[4].max,
    metodo,
    detalle: `FCmax Tanaka (${edad} años): **${fcMax} lpm**. Método: ${metodo}. Z1 ${zonas[0].min}-${zonas[0].max} | Z2 ${zonas[1].min}-${zonas[1].max} | Z3 ${zonas[2].min}-${zonas[2].max} | Z4 ${zonas[3].min}-${zonas[3].max} | Z5 ${zonas[4].min}-${zonas[4].max} lpm.`,
  } as Outputs;
}
