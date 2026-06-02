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
  _insight?: any;
  _chart?: any;
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

  const minOut = min + extraTraslado;
  const idealOut = ideal + extraTraslado;
  const maxOut = max + extraTraslado;

  return {
    diasMinimos: minOut,
    diasIdeales: idealOut,
    diasMaximos: maxOut,
    detalle: `${d.nombre} con ritmo ${ritmo}${traslados ? ' (incluye traslados)' : ''} → mínimo ${minOut} días, ideal ${idealOut} días, máximo recomendado ${maxOut} días.`,
    _insight: {
      title: 'Cuántos días reservar',
      text: `Para ${d.nombre.toLowerCase()} a ritmo ${ritmo}, el punto óptimo son **${idealOut} días**${traslados ? ' (ya con un día extra de traslados)' : ''}. Con menos de **${minOut} días** vas a correr, y pasados los **${maxOut} días** empezás a tener tiempos muertos.`,
      tone: 'good',
      icon: '🧳',
    },
    _chart: {
      type: 'scale',
      marker: idealOut,
      markerLabel: `${idealOut} días (ideal)`,
      min: 0,
      segments: [
        { nombre: 'Te quedás corto', max: minOut, color: '#fca5a5', colorDark: '#7f1d1d' },
        { nombre: 'Justo / suficiente', max: idealOut, color: '#fcd34d', colorDark: '#78350f' },
        { nombre: 'Zona ideal', max: maxOut, color: '#86efac', colorDark: '#14532d' },
        { nombre: 'De más', max: maxOut + Math.max(2, Math.round(maxOut * 0.4)), color: '#93c5fd', colorDark: '#1e3a8a' },
      ],
      ariaLabel: `Escala de duración del viaje: ${minOut} días mínimo, ${idealOut} ideal, ${maxOut} máximo recomendado`,
    },
  };
}
