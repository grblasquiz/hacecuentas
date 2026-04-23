/** Tarjetas amarillas acumuladas y suspensión automática */
export interface Inputs {
  competencia: string;
  amarillasActuales: number;
  fechaActual: number;
  totalFechas: number;
}
export interface Outputs {
  umbralSuspension: string;
  amarillasParaSuspension: string;
  estadoActual: string;
  resetReglas: string;
  mensaje: string;
}

export function tarjetasAmarillasSuspension(i: Inputs): Outputs {
  const comp = String(i.competencia || 'laliga');
  const amarillas = Number(i.amarillasActuales) || 0;
  const fechaActual = Number(i.fechaActual) || 1;
  const totalFechas = Number(i.totalFechas) || 38;

  // Umbrales por competencia
  const umbrales: Record<string, { umbral: number; fechas: string; reset: string }> = {
    'laliga': { umbral: 5, fechas: '5 amarillas = 1 fecha de suspensión', reset: 'Reset al pasar la fecha 28 (se reinician las acumuladas salvo llegar a 5 en las últimas jornadas).' },
    'serie-a': { umbral: 5, fechas: '5 amarillas = 1 fecha de suspensión', reset: 'Reset parcial tras cuartos de copa / mitad de temporada.' },
    'bundesliga': { umbral: 5, fechas: '5 amarillas = 1 fecha de suspensión', reset: 'Reset al terminar la temporada.' },
    'ligue-1': { umbral: 3, fechas: '3 amarillas = 1 fecha de suspensión (acumuladas por ciclos)', reset: 'Se reinicia en cada ciclo de tarjetas.' },
    'premier-league': { umbral: 5, fechas: '5 amarillas antes de la J19 = 1 fecha. Desde J20: 10 amarillas = 2 fechas.', reset: 'Reset al terminar la fecha 19 si aún no llegaste a 5.' },
    'libertadores': { umbral: 3, fechas: '3 amarillas = 1 fecha de suspensión', reset: 'Reset al pasar de fase (de grupos a octavos, etc.).' },
    'champions-league': { umbral: 3, fechas: '3 amarillas = 1 fecha (reset al pasar a cuartos de final).', reset: 'Reset al iniciarse los cuartos de final.' },
    'copa-america': { umbral: 2, fechas: '2 amarillas en partidos distintos = 1 fecha de suspensión', reset: 'Reset al pasar a semifinales.' },
    'mundial-fifa': { umbral: 2, fechas: '2 amarillas en partidos distintos = 1 fecha de suspensión', reset: 'Reset al terminar cuartos de final.' },
    'liga-argentina': { umbral: 5, fechas: '5 amarillas = 1 fecha de suspensión', reset: 'Reset al terminar la temporada.' }
  };

  const info = umbrales[comp] || umbrales['laliga'];
  const faltan = Math.max(0, info.umbral - amarillas);
  const estado = faltan === 0
    ? `Jugador en SUSPENSIÓN: ya alcanzó el umbral (${amarillas}/${info.umbral}). No puede jugar la próxima fecha oficial.`
    : `Estado: ${amarillas}/${info.umbral} amarillas. Faltan ${faltan} amarilla(s) para suspensión.`;

  const fechasRestantes = Math.max(0, totalFechas - fechaActual);

  return {
    umbralSuspension: info.fechas,
    amarillasParaSuspension: faltan === 0 ? 'Ya suspendido.' : `${faltan} amarilla(s) más para ser suspendido.`,
    estadoActual: estado,
    resetReglas: info.reset,
    mensaje: `${comp.toUpperCase()}: ${amarillas}/${info.umbral}. Quedan ${fechasRestantes} fechas en la temporada. ${estado}`
  };
}
