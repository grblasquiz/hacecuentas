/** Calculadora de Duración de Playlist */
export interface Inputs { canciones: number; duracionPromMin: number; pausaEntreCanciones?: number; }
export interface Outputs { duracionTotal: string; horasDecimal: number; cancionesPorHora: number; mensaje: string; }

export function playlistDuracionCanciones(i: Inputs): Outputs {
  const n = Number(i.canciones);
  const dur = Number(i.duracionPromMin);
  const pausa = i.pausaEntreCanciones ? Number(i.pausaEntreCanciones) : 0;
  if (!n || n < 1) throw new Error('Ingresá la cantidad de canciones');
  if (!dur || dur <= 0) throw new Error('Ingresá la duración promedio');

  const totalMin = n * dur + (n - 1) * (pausa / 60);
  const horas = Math.floor(totalMin / 60);
  const mins = Math.round(totalMin % 60);
  const duracionTotal = horas > 0 ? `${horas} h ${mins} min` : `${mins} min`;
  const horasDecimal = totalMin / 60;
  const cancionesPorHora = Math.round(60 / dur);

  let mensaje: string;
  if (horasDecimal < 1) mensaje = 'Playlist corta — ideal para una sesión de gym o un viaje corto.';
  else if (horasDecimal < 3) mensaje = 'Playlist mediana — buena para una tarde o viaje en auto.';
  else if (horasDecimal < 8) mensaje = 'Playlist larga — te cubre una jornada laboral completa.';
  else mensaje = 'Playlist maratónica — suficiente para un viaje largo o fiesta de toda la noche.';

  return { duracionTotal, horasDecimal: Number(horasDecimal.toFixed(1)), cancionesPorHora, mensaje };
}
