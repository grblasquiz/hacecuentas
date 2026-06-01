/**
 * Descenso Serie A (Italia). 20 equipos, 3 descienden (18º-19º-20º).
 * Temporada regular 38 fechas.
 */

export interface DescensoSerieAInputs {
  puntosEquipo: number;
  puntosDecimoSeptimo: number;
  fechasRestantes: number;
  safetyThreshold?: number; // default 37
}

export interface DescensoSerieAOutputs {
  puntosParaAlcanzar17: number;
  puntosMaxPosibles: number;
  puntosEsperadosFinal: number;
  diferenciaConSafety: number;
  veredicto: string;
  _chart?: any;
}

export function descensoSerieAItalia(inputs: DescensoSerieAInputs): DescensoSerieAOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts17 = Number(inputs.puntosDecimoSeptimo) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 37;

  const fechasJugadas = Math.max(1, 38 - fechas);
  const proyeccion = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccion * 38);

  const puntosParaAlcanzar17 = Math.max(0, pts17 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;
  const diferenciaConSafety = pts - safety;

  let veredicto = '';
  if (puntosMaxPosibles < pts17) {
    veredicto = '🔴 Retrocesso matematico: imposible alcanzar al 17º.';
  } else if (pts >= safety && pts > pts17) {
    veredicto = '✅ Salvezza: cruzaste el umbral de los 37 puntos.';
  } else if (puntosEsperadosFinal >= safety) {
    veredicto = '🟢 Al ritmo actual te salvás.';
  } else if (puntosParaAlcanzar17 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Crisi: necesitás ganar casi todos.';
  } else if (puntosParaAlcanzar17 > fechas) {
    veredicto = '🟠 Complicado: varios triunfos directos.';
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
      { nombre: 'Salvo', max: safety + 12, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Holgado', max: Math.max(safety + 22, Math.ceil(puntosEsperadosFinal) + 3), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Proyección de puntos finales frente al umbral de salvezza de 37 puntos',
  };

  return {
    puntosParaAlcanzar17,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    diferenciaConSafety,
    veredicto,
    _chart: chart,
  };
}
