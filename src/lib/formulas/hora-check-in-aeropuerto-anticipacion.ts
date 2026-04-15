/** Hora de llegada al aeropuerto y hora de salida de casa */
export interface HoraCheckInInputs {
  horaVuelo: string;
  tipoVuelo?: string;
  despachaEquipaje?: string;
  temporada?: string;
  tiempoTrasladoMin?: number;
}
export interface HoraCheckInOutputs {
  horaLlegarAeropuerto: string;
  horaSalirCasa: string;
  anticipacionMin: number;
  detalle: string;
}

function parseHora(h: string): { horas: number; minutos: number } | null {
  const m = h.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const horas = parseInt(m[1], 10);
  const minutos = parseInt(m[2], 10);
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;
  return { horas, minutos };
}

function restarMinutos(horas: number, minutos: number, restar: number): string {
  let totalMin = horas * 60 + minutos - restar;
  if (totalMin < 0) totalMin += 24 * 60; // día anterior
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function horaCheckInAeropuertoAnticipacion(inputs: HoraCheckInInputs): HoraCheckInOutputs {
  const horaStr = String(inputs.horaVuelo || '').trim();
  const tipo = String(inputs.tipoVuelo || 'internacional');
  const equipaje = String(inputs.despachaEquipaje || 'si') === 'si';
  const temporada = String(inputs.temporada || 'normal');
  const traslado = Number(inputs.tiempoTrasladoMin) || 60;

  const hora = parseHora(horaStr);
  if (!hora) throw new Error('Ingresá la hora del vuelo en formato HH:MM (ej: 14:30)');
  if (traslado < 10 || traslado > 300) throw new Error('El tiempo de traslado debe estar entre 10 y 300 minutos');

  // Anticipación base según tipo de vuelo
  let anticipacion: number;
  const pasos: string[] = [];

  if (tipo === 'internacional') {
    anticipacion = 180; // 3 horas
    if (equipaje) {
      pasos.push('Check-in + equipaje: 30 min');
    } else {
      pasos.push('Check-in online: 10 min');
      anticipacion -= 20;
    }
    pasos.push('Migraciones: 30 min');
    pasos.push('Seguridad: 15 min');
    pasos.push('Caminata a puerta: 15 min');
    pasos.push('Embarque: 30 min antes');
  } else if (tipo === 'nacional') {
    anticipacion = 120; // 2 horas
    if (equipaje) {
      pasos.push('Check-in + equipaje: 25 min');
    } else {
      pasos.push('Check-in online: 5 min');
      anticipacion -= 20;
    }
    pasos.push('Seguridad: 15 min');
    pasos.push('Caminata a puerta: 10 min');
    pasos.push('Embarque: 25 min antes');
  } else {
    // lowcost
    anticipacion = 90; // 1.5 horas
    pasos.push('Check-in online: 5 min');
    pasos.push('Seguridad: 15 min');
    pasos.push('Caminata a puerta: 10 min');
    pasos.push('Embarque: 25 min antes');
  }

  // Temporada alta: +30-45 min
  if (temporada === 'alta') {
    anticipacion += 45;
    pasos.push('Extra temporada alta: +45 min');
  }

  const horaAeropuerto = restarMinutos(hora.horas, hora.minutos, anticipacion);
  const horaSalir = restarMinutos(hora.horas, hora.minutos, anticipacion + traslado);

  const tipoLabel = tipo === 'internacional' ? 'internacional' : tipo === 'nacional' ? 'nacional' : 'low-cost';

  return {
    horaLlegarAeropuerto: horaAeropuerto,
    horaSalirCasa: horaSalir,
    anticipacionMin: anticipacion,
    detalle: `Vuelo ${tipoLabel} a las ${horaStr}. Anticipación: ${anticipacion} min. Llegar al aeropuerto: ${horaAeropuerto}. Con ${traslado} min de traslado: salir de casa a las ${horaSalir}. Pasos: ${pasos.join(' → ')}.`,
  };
}
