/** Frecuencia cardíaca máxima por edad — Tanaka y Fox */
export interface Inputs {
  edad: number;
}
export interface Outputs {
  fcMaxTanaka: number;
  fcMaxFox: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
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

  // Zona de quema de grasa / aeróbica recomendada (60-80% de FCmax)
  const quemaMin = Math.round(tanaka * 0.6);
  const aerobicoMax = Math.round(tanaka * 0.8);
  const dif = Math.abs(tanaka - fox);

  return {
    fcMaxTanaka: tanaka,
    fcMaxFox: fox,
    detalle,
    _insight: {
      title: 'Tu frecuencia cardíaca máxima',
      text: `Tu FCmax estimada es **${tanaka} lpm** (Tanaka, la más precisa hoy; Fox da ${fox} lpm, ${dif} de diferencia). Para quemar grasa y mejorar el fondo aeróbico, entrená entre **${quemaMin} y ${aerobicoMax} lpm** (60-80%). Acercarte a ${tanaka} solo en esfuerzos máximos cortos.`,
      tone: 'neutral',
      icon: '❤️',
    },
    _chart: {
      type: 'scale',
      marker: tanaka,
      markerLabel: `FCmax ${tanaka}`,
      min: Math.round(tanaka * 0.5),
      segments: [
        { nombre: 'Z1 Recuperación', max: Math.round(tanaka * 0.6), color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Z2 Quema grasa', max: Math.round(tanaka * 0.7), color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Z3 Aeróbico', max: Math.round(tanaka * 0.8), color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Z4 Umbral', max: Math.round(tanaka * 0.9), color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Z5 Máximo', max: tanaka, color: '#ef4444', colorDark: '#f87171' },
      ],
      ariaLabel: `Frecuencia cardíaca máxima de ${tanaka} lpm y las cinco zonas de entrenamiento`,
    },
  };
}
