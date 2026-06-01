/** Calculadora de Frecuencia de Nota Musical */
export interface Inputs {
  nota: string;
  octava: number;
  afinacionBase: number;
}
export interface Outputs {
  frecuencia: number;
  notaNombre: string;
  longOnda: number;
  midiNote: number;
  _insight?: any;
}

const NOMBRES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function afinacionFrecuenciaNota(i: Inputs): Outputs {
  const notaIdx = Number(i.nota);
  const octava = Number(i.octava);
  const base = Number(i.afinacionBase);

  if (isNaN(notaIdx) || notaIdx < 0 || notaIdx > 11) throw new Error('Seleccioná una nota válida');
  if (isNaN(octava) || octava < 0 || octava > 8) throw new Error('Octava debe estar entre 0 y 8');
  if (!base || base <= 0) throw new Error('Ingresá la afinación base');

  // MIDI note: C4 = 60, A4 = 69
  const midiNote = (octava + 1) * 12 + notaIdx;

  // Semitones from A4 (MIDI 69)
  const semitonesFromA4 = midiNote - 69;

  // freq = base * 2^(semitones/12)
  const frecuencia = base * Math.pow(2, semitonesFromA4 / 12);

  // Wavelength: speed of sound (343 m/s) / frequency
  const longOnda = 343 / frecuencia;

  const notaNombre = `${NOMBRES[notaIdx]}${octava}`;

  // Insight: interpretar la nota, su frecuencia y la afinación elegida vs el estándar 440 Hz.
  const desvioStd = base - 440;
  const refTxt = Math.abs(desvioStd) < 0.01
    ? `con el estándar **A4 = 440 Hz**`
    : `con una afinación base de **${base} Hz** (${desvioStd > 0 ? '+' : ''}${desvioStd.toFixed(1)} Hz vs el estándar 440)`;
  const insightTone = Math.abs(desvioStd) < 0.01 ? 'good' : 'neutral';
  const insightText = `La nota **${notaNombre}** vibra a **${frecuencia.toFixed(2)} Hz** ${refTxt}. Su onda mide **${longOnda.toFixed(2)} m** en el aire (343 m/s) y corresponde al MIDI **${midiNote}**.`;

  return {
    frecuencia: Number(frecuencia.toFixed(2)),
    notaNombre,
    longOnda: Number(longOnda.toFixed(3)),
    midiNote,
    _insight: {
      title: 'Tu nota en números',
      text: insightText,
      tone: insightTone,
      icon: '🎵',
    },
  };
}
