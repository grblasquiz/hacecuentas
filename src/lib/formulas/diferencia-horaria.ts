/** Diferencia horaria entre ciudades */
export interface DiferenciaHorariaInputs {
  ciudadOrigen?: string;
  ciudadDestino?: string;
}
export interface DiferenciaHorariaOutputs {
  diferenciaHoras: number;
  horaActualDestino: string;
  detalle: string;
  _insight?: any;
}

interface CiudadInfo {
  nombre: string;
  utc: number;
}

const CIUDADES: Record<string, CiudadInfo> = {
  'buenos-aires': { nombre: 'Buenos Aires', utc: -3 },
  santiago: { nombre: 'Santiago', utc: -4 },
  lima: { nombre: 'Lima', utc: -5 },
  bogota: { nombre: 'Bogotá', utc: -5 },
  mexico: { nombre: 'Ciudad de México', utc: -6 },
  madrid: { nombre: 'Madrid', utc: 1 },
  roma: { nombre: 'Roma', utc: 1 },
  paris: { nombre: 'París', utc: 1 },
  londres: { nombre: 'Londres', utc: 0 },
  'nueva-york': { nombre: 'Nueva York', utc: -5 },
  miami: { nombre: 'Miami', utc: -5 },
  'los-angeles': { nombre: 'Los Ángeles', utc: -8 },
  tokio: { nombre: 'Tokio', utc: 9 },
  sydney: { nombre: 'Sídney', utc: 10 },
};

export function diferenciaHoraria(inputs: DiferenciaHorariaInputs): DiferenciaHorariaOutputs {
  const origenKey = String(inputs.ciudadOrigen || 'buenos-aires');
  const destinoKey = String(inputs.ciudadDestino || 'madrid');

  if (!CIUDADES[origenKey]) throw new Error('Ciudad de origen no válida');
  if (!CIUDADES[destinoKey]) throw new Error('Ciudad de destino no válida');

  const origen = CIUDADES[origenKey];
  const destino = CIUDADES[destinoKey];

  const diferencia = destino.utc - origen.utc;

  // Si en origen son las 12:00, en destino son...
  let horaDestino = 12 + diferencia;
  if (horaDestino < 0) horaDestino += 24;
  if (horaDestino >= 24) horaDestino -= 24;

  const horaStr = `${horaDestino.toString().padStart(2, '0')}:00 en ${destino.nombre}`;

  const signo = diferencia >= 0 ? '+' : '';
  const adelanteAtraso = diferencia > 0
    ? `${destino.nombre} está ${diferencia} hora(s) adelantada`
    : diferencia < 0
      ? `${destino.nombre} está ${Math.abs(diferencia)} hora(s) atrasada`
      : 'Misma zona horaria';

  const abs = Math.abs(diferencia);
  let insightText: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (abs === 0) {
    insightText = `${origen.nombre} y ${destino.nombre} comparten la **misma hora**: podés coordinar llamadas a cualquier horario sin cálculos.`;
    tone = 'good';
  } else if (abs <= 3) {
    insightText = `Apenas **${abs} h** de diferencia (${destino.nombre} ${diferencia > 0 ? 'adelantada' : 'atrasada'}): hay franjas cómodas en común para coordinar reuniones.`;
    tone = 'good';
  } else if (abs <= 7) {
    insightText = `**${abs} h** de diferencia: la ventana en común es chica. Buscá horarios de mañana en uno / tarde en el otro.`;
    tone = 'neutral';
  } else {
    insightText = `**${abs} h** de diferencia es mucho: cuando en ${origen.nombre} es mediodía, en ${destino.nombre} son las **${horaDestino.toString().padStart(2, '0')}:00**. Coordinar en vivo es difícil, considerá modo asíncrono.`;
    tone = 'warn';
  }

  return {
    diferenciaHoras: diferencia,
    horaActualDestino: horaStr,
    detalle: `${origen.nombre} (UTC${origen.utc >= 0 ? '+' : ''}${origen.utc}) → ${destino.nombre} (UTC${destino.utc >= 0 ? '+' : ''}${destino.utc}): diferencia de ${signo}${diferencia} horas. ${adelanteAtraso}. Si en ${origen.nombre} son las 12:00, en ${destino.nombre} son las ${horaStr}. Nota: la diferencia puede variar ±1 hora por horario de verano (DST).`,
    _insight: { title: 'Coordinar entre zonas', text: insightText, tone, icon: '🕐' },
  };
}
