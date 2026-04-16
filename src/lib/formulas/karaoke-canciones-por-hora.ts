/** Calculadora de Canciones de Karaoke por Hora */
export interface Inputs { duracionSesionMin: number; duracionCancionMin: number; tiempoEntreMin: number; cantantes: number; }
export interface Outputs { cancionesTotal: number; cancionesPorPersona: number; tiempoEspera: number; mensaje: string; }

export function karaokeCancionesPorHora(i: Inputs): Outputs {
  const sesion = Number(i.duracionSesionMin);
  const cancion = Number(i.duracionCancionMin);
  const entre = Number(i.tiempoEntreMin);
  const cant = Number(i.cantantes);
  if (!sesion || sesion <= 0) throw new Error('Ingresá la duración de la sesión');
  if (!cancion || cancion <= 0) throw new Error('Ingresá la duración por canción');
  if (!entre) throw new Error('Ingresá el tiempo entre canciones');
  if (!cant || cant < 1) throw new Error('Ingresá la cantidad de cantantes');

  const tiempoPorCancion = cancion + entre;
  const cancionesTotal = Math.floor(sesion / tiempoPorCancion);
  const cancionesPorPersona = Math.floor(cancionesTotal / cant);
  const tiempoEspera = Math.round((cant - 1) * tiempoPorCancion);

  let mensaje = `En ${sesion} min entran ${cancionesTotal} canciones. `;
  if (cancionesPorPersona < 2) mensaje += 'Pocas canciones por persona — alargá la sesión o reducí el grupo.';
  else if (cancionesPorPersona < 4) mensaje += 'Buen balance — cada uno canta un par de temas.';
  else mensaje += '¡Noche larga de karaoke! Preparate con agua y caramelos para la garganta.';

  return { cancionesTotal, cancionesPorPersona, tiempoEspera, mensaje };
}
