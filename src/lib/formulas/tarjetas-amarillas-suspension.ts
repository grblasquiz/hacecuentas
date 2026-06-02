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
  _insight?: any;
  _chart?: any;
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

  // Tono e insight dinámicos según cercanía al umbral
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (faltan === 0) {
    insightTone = 'warn';
    insightText = `Con **${amarillas}/${info.umbral} amarillas** el jugador alcanzó el umbral y **se pierde la próxima fecha** por suspensión automática.`;
  } else if (faltan === 1) {
    insightTone = 'warn';
    insightText = `Con **${amarillas}/${info.umbral} amarillas** está **a una sola tarjeta** de la suspensión. Una amonestación más y se pierde un partido.`;
  } else {
    insightTone = 'good';
    insightText = `Con **${amarillas}/${info.umbral} amarillas** todavía hay margen: faltan **${faltan} amarillas** para la suspensión. Quedan **${fechasRestantes} fechas** en el torneo.`;
  }

  const _insight = {
    title: 'Qué significa este resultado',
    text: insightText,
    tone: insightTone,
    icon: '🟨',
  };

  // Gauge: marcador = amarillas actuales sobre el umbral de suspensión
  const umbral = info.umbral;
  const cuidadoMax = Math.max(1, umbral - 1); // zona de riesgo: la última antes del umbral
  const markerCapped = Math.min(amarillas, umbral); // mantener el marcador dentro del último segmento
  const _chart = {
    type: 'scale' as const,
    marker: markerCapped,
    markerLabel: `${amarillas} amarilla${amarillas === 1 ? '' : 's'}`,
    min: 0,
    segments: [
      { nombre: 'Margen', max: cuidadoMax, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Riesgo', max: umbral, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Suspendido', max: umbral + 1, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Amarillas acumuladas (${amarillas}) frente al umbral de suspensión de ${umbral}.`,
  };

  return {
    umbralSuspension: info.fechas,
    amarillasParaSuspension: faltan === 0 ? 'Ya suspendido.' : `${faltan} amarilla(s) más para ser suspendido.`,
    estadoActual: estado,
    resetReglas: info.reset,
    mensaje: faltan === 0
      ? `${amarillas}/${info.umbral}: suspendido`
      : `Faltan ${faltan} para suspensión`,
    _insight,
    _chart,
  };
}
