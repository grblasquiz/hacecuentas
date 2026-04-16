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

  return {
    frecuencia: Number(frecuencia.toFixed(2)),
    notaNombre,
    longOnda: Number(longOnda.toFixed(3)),
    midiNote,
  };
}
