/** Días ideales según tipo de destino */
export interface DiasIdealesViajeInputs {
  tipoDestino?: string;
  ritmo?: string;
  incluyeTraslados?: string;
}
export interface DiasIdealesViajeOutputs {
  diasMinimos: number;
  diasIdeales: number;
  diasMaximos: number;
  detalle: string;
}

interface DestinoConfig {
  nombre: string;
  relajado: [number, number, number]; // min, ideal, max
  moderado: [number, number, number];
  intenso: [number, number, number];
}

const DESTINOS: Record<string, DestinoConfig> = {
  'ciudad-grande': {
    nombre: 'Ciudad grande',
    relajado: [4, 6, 9],
    moderado: [3, 5, 7],
    intenso: [2, 4, 5],
  },
  'ciudad-chica': {
    nombre: 'Ciudad chica',
    relajado: [2, 3, 5],
    moderado: [2, 3, 4],
    intenso: [1, 2, 3],
  },
  playa: {
    nombre: 'Playa',
    relajado: [5, 7, 14],
    moderado: [4, 6, 10],
    intenso: [3, 4, 7],
  },
  montana: {
    nombre: 'Montaña / Naturaleza',
    relajado: [4, 6, 10],
    moderado: [3, 5, 8],
    intenso: [3, 4, 6],
  },
  'ruta-multiple': {
    nombre: 'Ruta múltiples destinos',
    relajado: [10, 15, 21],
    moderado: [7, 12, 18],
    intenso: [5, 10, 14],
  },
};

export function diasIdealesViaje(inputs: DiasIdealesViajeInputs): DiasIdealesViajeOutputs {
  const destinoKey = String(inputs.tipoDestino || 'ciudad-grande');
  const ritmo = String(inputs.ritmo || 'moderado') as 'relajado' | 'moderado' | 'intenso';
  const traslados = String(inputs.incluyeTraslados || 'si') === 'si';

  if (!DESTINOS[destinoKey]) throw new Error('Tipo de destino no válido');
  if (!['relajado', 'moderado', 'intenso'].includes(ritmo)) throw new Error('Ritmo no válido');

  const d = DESTINOS[destinoKey];
  const [min, ideal, max] = d[ritmo];

  const extraTraslado = traslados ? 1 : 0;

  return {
    diasMinimos: min + extraTraslado,
    diasIdeales: ideal + extraTraslado,
    diasMaximos: max + extraTraslado,
    detalle: `${d.nombre} con ritmo ${ritmo}${traslados ? ' (incluye traslados)' : ''} → mínimo ${min + extraTraslado} días, ideal ${ideal + extraTraslado} días, máximo recomendado ${max + extraTraslado} días.`,
  };
}
