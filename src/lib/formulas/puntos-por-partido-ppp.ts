/** Puntos por partido (PPP) y proyección de temporada completa. */
export interface Inputs {
  puntosActuales: number;
  fechasJugadas: number;
  fechasTotales: number;
}
export interface Outputs {
  ppp: number;
  proyeccionPuntos: number;
  fechasRestantes: number;
  puntosFaltantes: number;
  rendimientoCategoria: string;
  mensaje: string;
}

export function puntosPorPartidoPpp(i: Inputs): Outputs {
  if (!i.fechasJugadas || i.fechasJugadas <= 0) throw new Error('Fechas jugadas debe ser > 0.');
  if (!i.fechasTotales || i.fechasTotales <= 0) throw new Error('Fechas totales debe ser > 0.');
  if (i.fechasJugadas > i.fechasTotales) throw new Error('Las fechas jugadas no pueden superar las totales.');
  const ppp = i.puntosActuales / i.fechasJugadas;
  const proyeccion = ppp * i.fechasTotales;
  const restantes = i.fechasTotales - i.fechasJugadas;
  const faltan = proyeccion - i.puntosActuales;

  // Rangos típicos ligas europeas/sudamericanas:
  // > 2.20 PPP = campeón / líder absoluto
  // 1.80–2.20 = clasificación europea
  // 1.30–1.79 = zona media
  // 0.90–1.29 = media-baja
  // < 0.90 = zona descenso
  let cat = 'Zona descenso';
  if (ppp >= 2.2) cat = 'Ritmo de campeón';
  else if (ppp >= 1.8) cat = 'Clasificación a torneos internacionales';
  else if (ppp >= 1.3) cat = 'Zona media de tabla';
  else if (ppp >= 0.9) cat = 'Media-baja / permanencia ajustada';

  return {
    ppp: Math.round(ppp * 1000) / 1000,
    proyeccionPuntos: Math.round(proyeccion * 10) / 10,
    fechasRestantes: restantes,
    puntosFaltantes: Math.round(faltan * 10) / 10,
    rendimientoCategoria: cat,
    mensaje: `PPP ${ppp.toFixed(2)} → proyección ${Math.round(proyeccion)} pts en ${i.fechasTotales} fechas (${cat}).`,
  };
}
