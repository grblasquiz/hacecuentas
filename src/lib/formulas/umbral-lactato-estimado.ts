/** Umbral de lactato estimado */
export interface Inputs {
  fcMaxima: number;
  nivel: string;
  paceActual5k: number;
}
export interface Outputs {
  fcUmbral: number;
  porcentajeFcMax: number;
  paceUmbral: string;
  zonaUmbral: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function umbralLactatoEstimado(i: Inputs): Outputs {
  const fcMaxima = Number(i.fcMaxima);
  const nivel = String(i.nivel || 'intermedio');
  const pace5k = Number(i.paceActual5k) || 0;
  if (!fcMaxima || fcMaxima <= 0) throw new Error('Ingresá tu FC máxima');

  // LT2 as % of HRmax by training level
  const pctMap: Record<string, number> = {
    principiante: 0.81, intermedio: 0.86, avanzado: 0.89, elite: 0.91
  };
  const pct = pctMap[nivel] || 0.86;
  const fcUmbral = Math.round(fcMaxima * pct);
  const porcentajeFcMax = Math.round(pct * 100);

  // Pace de umbral: ~105-108% del pace 5K (5K is slightly above LT2)
  let paceUmbral = 'Ingresá tu pace de 5K para estimar';
  if (pace5k > 0) {
    const paceUmbralVal = pace5k * 1.07;
    const min = Math.floor(paceUmbralVal);
    const sec = Math.round((paceUmbralVal - min) * 60);
    paceUmbral = `${min}:${String(sec).padStart(2, '0')} min/km (estimado)`;
  }

  const zonaUmbral = `${Math.round(fcMaxima * (pct - 0.03))}-${Math.round(fcMaxima * (pct + 0.03))} lpm`;

  // Gauge: FC del umbral ubicada en las zonas de entrenamiento (% de FCmax)
  const chart = {
    type: 'scale' as const,
    marker: fcUmbral,
    markerLabel: 'Tu umbral: ' + fcUmbral + ' lpm',
    min: Math.round(fcMaxima * 0.5),
    unit: ' lpm',
    segments: [
      { nombre: 'Recuperación', max: Math.round(fcMaxima * 0.70), color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Aeróbico', max: Math.round(fcMaxima * 0.80), color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Tempo', max: Math.round(fcMaxima * 0.87), color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Umbral', max: Math.round(fcMaxima * 0.92), color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'VO2 máx', max: Math.max(Math.round(fcMaxima), Math.ceil(fcUmbral) + 5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de zonas de frecuencia cardíaca según % de FCmax: recuperación, aeróbico, tempo, umbral y VO2 máx.',
  };

  const insight = {
    title: 'Tu umbral de lactato (LT2)',
    text: `Tu umbral está en **${fcUmbral} lpm** (**${porcentajeFcMax}% de tu FCmax**), el ritmo más rápido que podés sostener sin que el lactato se dispare. Entrená en la zona **${zonaUmbral}** para elevarlo${pace5k > 0 ? `; tu pace de umbral ronda los **${paceUmbral}**` : ''}. Es el predictor de rendimiento en carreras de 10K a maratón.`,
    tone: 'neutral' as const,
    icon: '🏃',
  };

  return {
    fcUmbral,
    porcentajeFcMax,
    paceUmbral,
    zonaUmbral,
    mensaje: `Umbral estimado: ${fcUmbral} lpm (${porcentajeFcMax}% FCmax). Zona: ${zonaUmbral}.`,
    _insight: insight,
    _chart: chart,
  };
}