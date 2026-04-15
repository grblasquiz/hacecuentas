/** Diferencia horaria entre ciudades */
export interface DiferenciaHorariaInputs {
  ciudadOrigen?: string;
  ciudadDestino?: string;
}
export interface DiferenciaHorariaOutputs {
  diferenciaHoras: number;
  horaActualDestino: string;
  detalle: string;
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

  return {
    diferenciaHoras: diferencia,
    horaActualDestino: horaStr,
    detalle: `${origen.nombre} (UTC${origen.utc >= 0 ? '+' : ''}${origen.utc}) → ${destino.nombre} (UTC${destino.utc >= 0 ? '+' : ''}${destino.utc}): diferencia de ${signo}${diferencia} horas. ${adelanteAtraso}. Si en ${origen.nombre} son las 12:00, en ${destino.nombre} son las ${horaStr}. Nota: la diferencia puede variar ±1 hora por horario de verano (DST).`,
  };
}
