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

  return {
    headroom: Number(headroom.toFixed(1)),
    headroomIdeal,
    lufsTarget,
    recomendacion,
  };
}
