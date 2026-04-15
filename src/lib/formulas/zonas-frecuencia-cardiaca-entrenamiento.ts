/** Zonas de frecuencia cardíaca de entrenamiento (método Karvonen) */
export interface Inputs {
  edad: number;
  fcReposo: number;
  fcMax: number; // si 0, se calcula con 220-edad
}

export interface Outputs {
  fcMaxCalculada: number;
  fcReserva: number;
  zona1: { min: number; max: number; nombre: string };
  zona2: { min: number; max: number; nombre: string };
  zona3: { min: number; max: number; nombre: string };
  zona4: { min: number; max: number; nombre: string };
  zona5: { min: number; max: number; nombre: string };
  resumen: string;
  _chart?: any;
}

export function zonasFrecuenciaCardiacaEntrenamiento(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const fcRep = Number(i.fcReposo);
  let fcMax = Number(i.fcMax);

  if (!edad || edad < 10 || edad > 100) throw new Error('Ingresá una edad válida');
  if (!fcRep || fcRep < 30 || fcRep > 120) throw new Error('Ingresá FC reposo entre 30 y 120');

  if (!fcMax) fcMax = 220 - edad;
  if (fcMax <= fcRep) throw new Error('FC máxima debe ser mayor que FC reposo');

  const reserva = fcMax - fcRep;

  const zona = (pMin: number, pMax: number) => ({
    min: Math.round(fcRep + reserva * pMin),
    max: Math.round(fcRep + reserva * pMax),
  });

  const z1 = { ...zona(0.50, 0.60), nombre: 'Recuperación activa' };
  const z2 = { ...zona(0.60, 0.70), nombre: 'Aeróbico suave (quema grasa)' };
  const z3 = { ...zona(0.70, 0.80), nombre: 'Aeróbico (umbral aeróbico)' };
  const z4 = { ...zona(0.80, 0.90), nombre: 'Umbral anaeróbico' };
  const z5 = { ...zona(0.90, 1.00), nombre: 'Máximo (VO2max)' };

  // Chart: barras horizontales, cada barra es un rango [min, max] por zona
  const zonas = [
    { key: 'Z1 · Recuperación', range: [z1.min, z1.max] },
    { key: 'Z2 · Aeróbico suave', range: [z2.min, z2.max] },
    { key: 'Z3 · Aeróbico', range: [z3.min, z3.max] },
    { key: 'Z4 · Umbral', range: [z4.min, z4.max] },
    { key: 'Z5 · Máximo', range: [z5.min, z5.max] },
  ];
  const chart = {
    type: 'bar' as const,
    indexAxis: 'y',
    ariaLabel: `Zonas de frecuencia cardíaca: Z1 ${z1.min}-${z1.max}, Z2 ${z2.min}-${z2.max}, Z3 ${z3.min}-${z3.max}, Z4 ${z4.min}-${z4.max}, Z5 ${z5.min}-${z5.max} bpm. FC máxima ${Math.round(fcMax)} bpm.`,
    data: {
      labels: zonas.map((z) => z.key),
      datasets: [
        {
          label: 'Rango bpm',
          data: zonas.map((z) => [z.range[0], z.range[1]]),
          suffix: ' bpm',
        },
      ],
    },
    xRange: [fcRep, Math.round(fcMax)],
  };

  return {
    fcMaxCalculada: Math.round(fcMax),
    fcReserva: Math.round(reserva),
    zona1: z1,
    zona2: z2,
    zona3: z3,
    zona4: z4,
    zona5: z5,
    resumen: `Tu FCmax es ${Math.round(fcMax)} bpm y tu reserva cardíaca ${Math.round(reserva)} bpm. Entrená la mayor parte del tiempo en **Z2 (${z2.min}-${z2.max} bpm)** para quemar grasa y fortalecer base aeróbica.`,
    _chart: chart,
  };
}
