/** Hora local de llegada sumando horas de vuelo y cambio de zona horaria */
export interface Inputs {
  horaSalida: string; // "HH:MM"
  diferenciaHorariaDestino: number; // ej -3 (BA) vs +1 (Madrid) = +4
  duracionVueloHoras: number; // puede ser 10.5
}

export interface Outputs {
  horaLlegadaLocal: string;
  duracionReal: string;
  diasQueAvanza: number;
  horaLlegadaOrigen: string;
  resumen: string;
}

export function horarioLlegadaZonaHoraria(i: Inputs): Outputs {
  const hs = String(i.horaSalida || '10:00');
  const diff = Number(i.diferenciaHorariaDestino);
  const dur = Number(i.duracionVueloHoras);

  if (isNaN(diff)) throw new Error('Ingresá la diferencia horaria entre origen y destino');
  if (!dur || dur <= 0) throw new Error('Ingresá la duración del vuelo');
  if (!/^\d{1,2}:\d{2}$/.test(hs)) throw new Error('Formato de hora inválido (HH:MM)');

  const [h, m] = hs.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) throw new Error('Hora inválida');

  const minutosSalida = h * 60 + m;
  const minutosVuelo = dur * 60;
  const minutosDiff = diff * 60;

  // Hora de llegada en horario del origen
  const llegadaOrigenMin = minutosSalida + minutosVuelo;
  const llegadaOrigenH = Math.floor(llegadaOrigenMin / 60) % 24;
  const llegadaOrigenM = Math.round(llegadaOrigenMin % 60);

  // Hora de llegada en horario del destino
  let llegadaDestinoMin = minutosSalida + minutosVuelo + minutosDiff;
  let dias = 0;
  while (llegadaDestinoMin >= 24 * 60) {
    llegadaDestinoMin -= 24 * 60;
    dias++;
  }
  while (llegadaDestinoMin < 0) {
    llegadaDestinoMin += 24 * 60;
    dias--;
  }
  const llegadaDestinoH = Math.floor(llegadaDestinoMin / 60);
  const llegadaDestinoM = Math.round(llegadaDestinoMin % 60);

  const durH = Math.floor(dur);
  const durM = Math.round((dur - durH) * 60);

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  const diaTexto = dias === 0 ? 'mismo día' : dias === 1 ? 'día siguiente' : dias === -1 ? 'día anterior' : `${Math.abs(dias)} días ${dias > 0 ? 'después' : 'antes'}`;

  return {
    horaLlegadaLocal: fmt(llegadaDestinoH, llegadaDestinoM),
    duracionReal: `${durH}h ${String(durM).padStart(2, '0')}m`,
    diasQueAvanza: dias,
    horaLlegadaOrigen: fmt(llegadaOrigenH, llegadaOrigenM),
    resumen: `Salís a las ${hs}, viajás ${durH}h ${durM}m con ${diff >= 0 ? '+' : ''}${diff}h de diferencia → **llegás a las ${fmt(llegadaDestinoH, llegadaDestinoM)} del ${diaTexto}**.`,
  };
}
