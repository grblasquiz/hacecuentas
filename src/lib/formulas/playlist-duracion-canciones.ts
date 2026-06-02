/** Calculadora de Duración de Playlist */
export interface Inputs { canciones: number; duracionPromMin: number; pausaEntreCanciones?: number; __lang?: string; }
export interface Outputs { duracionTotal: string; horasDecimal: number; cancionesPorHora: number; mensaje: string; _insight?: any; }

export function playlistDuracionCanciones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCanciones: 'Ingresá la cantidad de canciones',
      errorDuracion: 'Ingresá la duración promedio',
      corta: 'Playlist corta — ideal para una sesión de gym o un viaje corto.',
      mediana: 'Playlist mediana — buena para una tarde o viaje en auto.',
      larga: 'Playlist larga — te cubre una jornada laboral completa.',
      maratonica: 'Playlist maratónica — suficiente para un viaje largo o fiesta de toda la noche.',
      insightTitle: 'Cuánto dura tu playlist',
    },
    en: {
      errorCanciones: 'Enter the number of songs',
      errorDuracion: 'Enter the average song duration',
      corta: 'Short playlist — perfect for a gym session or a quick trip.',
      mediana: 'Medium playlist — great for an afternoon or a car ride.',
      larga: 'Long playlist — enough to cover a full workday.',
      maratonica: 'Marathon playlist — enough for a long trip or an all-night party.',
      insightTitle: 'How long your playlist lasts',
    },
  } as const)[__lang];

  const n = Number(i.canciones);
  const dur = Number(i.duracionPromMin);
  const pausa = i.pausaEntreCanciones ? Number(i.pausaEntreCanciones) : 0;
  if (!n || n < 1) throw new Error(T.errorCanciones);
  if (!dur || dur <= 0) throw new Error(T.errorDuracion);

  const totalMin = n * dur + (n - 1) * (pausa / 60);
  const horas = Math.floor(totalMin / 60);
  const mins = Math.round(totalMin % 60);
  const duracionTotal = horas > 0 ? `${horas} h ${mins} min` : `${mins} min`;
  const horasDecimal = totalMin / 60;
  const cancionesPorHora = Math.round(60 / dur);

  let mensaje: string;
  if (horasDecimal < 1) mensaje = T.corta;
  else if (horasDecimal < 3) mensaje = T.mediana;
  else if (horasDecimal < 8) mensaje = T.larga;
  else mensaje = T.maratonica;

  const insightText = __lang === 'en'
    ? `**${n}** songs at **${dur} min** each add up to **${duracionTotal}** (~**${cancionesPorHora}** songs per hour). ${mensaje}`
    : `**${n}** canciones de **${dur} min** suman **${duracionTotal}** (~**${cancionesPorHora}** canciones por hora). ${mensaje}`;
  const _insight = {
    title: T.insightTitle,
    text: insightText,
    tone: 'neutral',
    icon: '🎧',
  };

  return { duracionTotal, horasDecimal: Number(horasDecimal.toFixed(1)), cancionesPorHora, mensaje, _insight };
}
