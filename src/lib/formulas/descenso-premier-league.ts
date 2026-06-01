/**
 * Descenso Premier League (Inglaterra). 20 equipos, 3 descienden (18º-19º-20º).
 * Temporada regular 38 fechas.
 *
 * Umbral de salvación histórico: 35-40 puntos. Promedio "40-point mark".
 */

export interface DescensoPremierInputs {
  puntosEquipo: number;
  puntosDecimoSeptimo: number;
  fechasRestantes: number;
  safetyThreshold?: number; // default 40
}

export interface DescensoPremierOutputs {
  puntosParaAlcanzar17: number;
  puntosMaxPosibles: number;
  proyeccionActualPorPartido: number;
  puntosEsperadosFinal: number;
  diferenciaConSafety: number;
  veredicto: string;
  _chart?: any;
  _insight?: any;
}

export function descensoPremierLeague(inputs: DescensoPremierInputs): DescensoPremierOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts17 = Number(inputs.puntosDecimoSeptimo) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 40;

  const fechasJugadas = Math.max(1, 38 - fechas);
  const proyeccionActualPorPartido = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccionActualPorPartido * 38);

  const puntosParaAlcanzar17 = Math.max(0, pts17 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;
  const diferenciaConSafety = pts - safety;

  let veredicto = '';
  if (puntosMaxPosibles < pts17) {
    veredicto = '🔴 Descendido matemáticamente: imposible superar al 17º.';
  } else if (pts >= safety && pts > pts17) {
    veredicto = '✅ Safe: cruzaste el umbral de los 40 puntos.';
  } else if (puntosEsperadosFinal >= safety) {
    veredicto = '🟢 Ritmo seguro: al paso actual terminás salvado.';
  } else if (puntosParaAlcanzar17 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Very tight: need a winning streak.';
  } else if (puntosParaAlcanzar17 > fechas) {
    veredicto = '🟠 Complicado: varios triunfos en run-in.';
  } else {
    veredicto = '🟡 En tus manos: 2-3 triunfos alcanzan.';
  }

  const chart = {
    type: 'scale' as const,
    marker: puntosEsperadosFinal,
    markerLabel: 'Proyección final: ' + puntosEsperadosFinal + ' pts',
    min: 0,
    unit: ' pts',
    segments: [
      { nombre: 'Descenso casi seguro', max: safety - 5, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Zona de descenso', max: safety, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Salvado', max: safety + 12, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Holgado', max: Math.max(safety + 22, Math.ceil(puntosEsperadosFinal) + 3), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Proyección de puntos finales frente al umbral de salvación de 40 puntos',
  };

  // Zona de la proyección final frente al umbral (mismos cortes que el _chart)
  let zona: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (puntosMaxPosibles < pts17) { zona = 'descenso matemático'; tone = 'warn'; }
  else if (puntosEsperadosFinal < safety - 5) { zona = 'descenso casi seguro'; tone = 'warn'; }
  else if (puntosEsperadosFinal < safety) { zona = 'zona de descenso'; tone = 'warn'; }
  else if (puntosEsperadosFinal < safety + 12) { zona = 'salvado'; tone = 'good'; }
  else { zona = 'holgado'; tone = 'good'; }

  const margen = puntosEsperadosFinal - safety;
  const insight = {
    title: 'Lectura del run-in',
    text: puntosMaxPosibles < pts17
      ? `Tu techo es **${puntosMaxPosibles} pts** y el 17º tiene **${pts17}**: ya no llegás, descenso matemático.`
      : `Al ritmo de **${proyeccionActualPorPartido.toFixed(2)} pts/partido** proyectás **${puntosEsperadosFinal} pts** al cierre — **${margen >= 0 ? margen + ' por encima' : Math.abs(margen) + ' por debajo'}** del umbral de los ${safety} (zona **${zona}**). Te quedan ${fechas} ${fechas === 1 ? 'fecha' : 'fechas'} y necesitás **${puntosParaAlcanzar17} ${puntosParaAlcanzar17 === 1 ? 'punto' : 'puntos'}** para pasar al 17º.`,
    tone,
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  };

  return {
    puntosParaAlcanzar17,
    puntosMaxPosibles,
    proyeccionActualPorPartido: Number(proyeccionActualPorPartido.toFixed(2)),
    puntosEsperadosFinal,
    diferenciaConSafety,
    veredicto,
    _chart: chart,
    _insight: insight,
  };
}
