/** Calculadora de Headroom para Mezcla y Mastering */
export interface Inputs {
  peakDbfs: number;
  lufsIntegrado: number;
  destino: string;
}
export interface Outputs {
  headroom: number;
  headroomIdeal: number;
  lufsTarget: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

const LUFS_TARGETS: Record<string, number> = {
  mastering: -18,
  spotify: -14,
  youtube: -13,
  apple: -16,
  cd: -9,
};

const HEADROOM_IDEAL: Record<string, number> = {
  mastering: 6,
  spotify: 1,
  youtube: 1,
  apple: 1,
  cd: 0.3,
};

export function mezclaAudioHeadroomDb(i: Inputs): Outputs {
  const peak = Number(i.peakDbfs);
  const lufs = Number(i.lufsIntegrado);
  const destino = i.destino;

  if (isNaN(peak)) throw new Error('Ingresá el pico máximo');
  if (isNaN(lufs)) throw new Error('Ingresá los LUFS integrados');
  if (peak > 0) throw new Error('El pico no puede superar 0 dBFS');

  const lufsTarget = LUFS_TARGETS[destino];
  const headroomIdeal = HEADROOM_IDEAL[destino];
  if (lufsTarget === undefined) throw new Error('Seleccioná un destino válido');

  const headroom = Math.abs(peak);
  const lufsDiff = lufs - lufsTarget;

  let recomendacion: string;
  if (destino === 'mastering') {
    if (headroom >= 6) {
      recomendacion = `Tu mezcla tiene ${headroom.toFixed(1)} dB de headroom — perfecto para mastering.`;
    } else if (headroom >= 3) {
      recomendacion = `Headroom de ${headroom.toFixed(1)} dB — aceptable pero idealmente dejá 6 dB. Bajá el fader master ${(6 - headroom).toFixed(1)} dB.`;
    } else {
      recomendacion = `Solo ${headroom.toFixed(1)} dB de headroom — demasiado bajo. Bajá el master ${(6 - headroom).toFixed(1)} dB antes de entregar.`;
    }
    if (lufs > -14) recomendacion += ' Tu mezcla parece muy comprimida (LUFS alto). Reducí la compresión en el master bus.';
  } else {
    if (lufsDiff > 2) {
      recomendacion = `Tu mezcla está ${lufsDiff.toFixed(1)} LUFS más fuerte que el target de ${destino} (${lufsTarget} LUFS). La plataforma la va a bajar, perdiendo impacto.`;
    } else if (lufsDiff < -3) {
      recomendacion = `Tu mezcla está ${Math.abs(lufsDiff).toFixed(1)} LUFS más baja que el target. Va a sonar más despacio que otras canciones en ${destino}.`;
    } else {
      recomendacion = `Tu mezcla está bien calibrada para ${destino} (${lufsTarget} LUFS). LUFS actual: ${lufs}, diferencia: ${lufsDiff.toFixed(1)}.`;
    }
  }

  const hr = Number(headroom.toFixed(1));

  // Insight dinámico según el caso real
  let insTitle: string;
  let insText: string;
  let insTone: 'good' | 'warn' | 'neutral';
  let insIcon: string;
  if (destino === 'mastering') {
    if (hr >= 6) {
      insTitle = 'Headroom listo para mastering';
      insText = `Dejaste **${hr} dB** de headroom: el ingeniero de mastering tiene margen de sobra para procesar sin clippear.`;
      insTone = 'good';
      insIcon = '🎚️';
    } else if (hr >= 3) {
      insTitle = 'Headroom justo';
      insText = `Tenés **${hr} dB** de headroom; lo ideal son **6 dB**. Bajá el master **${(6 - hr).toFixed(1)} dB** para darle aire al mastering.`;
      insTone = 'neutral';
      insIcon = '🎚️';
    } else {
      insTitle = 'Poco headroom para entregar';
      insText = `Sólo **${hr} dB** de headroom: muy pegado a 0 dBFS. Bajá el master **${(6 - hr).toFixed(1)} dB** antes de mandar a mastering.`;
      insTone = 'warn';
      insIcon = '⚠️';
    }
  } else {
    if (lufsDiff > 2) {
      insTitle = 'Más fuerte que el target';
      insText = `Tu mezcla está **${lufsDiff.toFixed(1)} LUFS** por encima del target de ${destino} (**${lufsTarget} LUFS**). La plataforma la va a bajar y perdés pegada e impacto.`;
      insTone = 'warn';
      insIcon = '🔉';
    } else if (lufsDiff < -3) {
      insTitle = 'Más baja que el target';
      insText = `Tu mezcla está **${Math.abs(lufsDiff).toFixed(1)} LUFS** por debajo del target de ${destino} (**${lufsTarget} LUFS**): va a sonar más despacio que el resto del catálogo.`;
      insTone = 'warn';
      insIcon = '🔈';
    } else {
      insTitle = 'Calibrada para la plataforma';
      insText = `A **${lufs} LUFS** estás a sólo **${lufsDiff.toFixed(1)} LUFS** del target de ${destino} (**${lufsTarget} LUFS**): bien calibrada para que no la toquen al normalizar.`;
      insTone = 'good';
      insIcon = '🎧';
    }
  }

  // Gauge de headroom en dB (zonas universales: bajo / aceptable / ideal)
  const gaugeMax = Math.max(8, Math.ceil(hr) + 1);
  const _chart = {
    type: 'scale',
    marker: hr,
    markerLabel: `${hr} dB`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 3, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Aceptable', max: 6, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Ideal', max: gaugeMax, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `Headroom de ${hr} dB sobre una escala de 0 a ${gaugeMax} dB`,
  };

  return {
    headroom: hr,
    headroomIdeal,
    lufsTarget,
    recomendacion,
    _insight: { title: insTitle, text: insText, tone: insTone, icon: insIcon },
    _chart,
  };
}
