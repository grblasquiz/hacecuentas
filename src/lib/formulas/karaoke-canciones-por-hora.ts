/** Calculadora de Canciones de Karaoke por Hora */
export interface Inputs { duracionSesionMin: number; duracionCancionMin: number; tiempoEntreMin: number; cantantes: number; __lang?: string; }
export interface Outputs { cancionesTotal: number; cancionesPorPersona: number; tiempoEspera: number; mensaje: string; }

export function karaokeCancionesPorHora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errSesion: 'Ingresá la duración de la sesión',
      errCancion: 'Ingresá la duración por canción',
      errEntre: 'Ingresá el tiempo entre canciones',
      errCantantes: 'Ingresá la cantidad de cantantes',
      msgPocas: 'Pocas canciones por persona — alargá la sesión o reducí el grupo.',
      msgBuen: 'Buen balance — cada uno canta un par de temas.',
      msgLarga: '¡Noche larga de karaoke! Preparate con agua y caramelos para la garganta.',
    },
    en: {
      errSesion: 'Enter the session duration',
      errCancion: 'Enter the song duration',
      errEntre: 'Enter the time between songs',
      errCantantes: 'Enter the number of singers',
      msgPocas: 'Few songs per person — extend the session or reduce the group.',
      msgBuen: 'Good balance — everyone gets to sing a couple of songs.',
      msgLarga: 'Long karaoke night! Have water and throat lozenges ready.',
    },
  } as const)[__lang];

  const sesion = Number(i.duracionSesionMin);
  const cancion = Number(i.duracionCancionMin);
  const entre = Number(i.tiempoEntreMin);
  const cant = Number(i.cantantes);
  if (!sesion || sesion <= 0) throw new Error(T.errSesion);
  if (!cancion || cancion <= 0) throw new Error(T.errCancion);
  if (!entre) throw new Error(T.errEntre);
  if (!cant || cant < 1) throw new Error(T.errCantantes);

  const tiempoPorCancion = cancion + entre;
  const cancionesTotal = Math.floor(sesion / tiempoPorCancion);
  const cancionesPorPersona = Math.floor(cancionesTotal / cant);
  const tiempoEspera = Math.round((cant - 1) * tiempoPorCancion);

  let mensaje = __lang === 'en'
    ? `In ${sesion} min you fit ${cancionesTotal} songs. `
    : `En ${sesion} min entran ${cancionesTotal} canciones. `;
  if (cancionesPorPersona < 2) mensaje += T.msgPocas;
  else if (cancionesPorPersona < 4) mensaje += T.msgBuen;
  else mensaje += T.msgLarga;

  return { cancionesTotal, cancionesPorPersona, tiempoEspera, mensaje };
}
