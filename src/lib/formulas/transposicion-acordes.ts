/** Calculadora de Transposición de Acordes */
export interface Inputs {
  acorde: string;
  semitonos: number;
}
export interface Outputs {
  acordeTranspuesto: string;
  intervalo: string;
  notaOriginal: string;
  notaNueva: string;
  _insight?: any;
}

const NOTAS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTAS_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const INTERVALOS: Record<number, string> = {
  0: 'Unísono', 1: 'Segunda menor', 2: 'Segunda mayor', 3: 'Tercera menor',
  4: 'Tercera mayor', 5: 'Cuarta justa', 6: 'Tritono', 7: 'Quinta justa',
  8: 'Sexta menor', 9: 'Sexta mayor', 10: 'Séptima menor', 11: 'Séptima mayor',
};

function parseNota(acorde: string): { nota: string; sufijo: string; indice: number; usaFlat: boolean } {
  const cleaned = acorde.trim();
  let nota: string;
  let sufijo: string;
  let usaFlat = false;

  if (cleaned.length >= 2 && (cleaned[1] === '#' || cleaned[1] === 'b')) {
    nota = cleaned.substring(0, 2);
    sufijo = cleaned.substring(2);
    usaFlat = cleaned[1] === 'b';
  } else {
    nota = cleaned.substring(0, 1);
    sufijo = cleaned.substring(1);
  }

  let indice = NOTAS_SHARP.indexOf(nota);
  if (indice === -1) indice = NOTAS_FLAT.indexOf(nota);
  if (indice === -1) throw new Error(`Nota "${nota}" no reconocida. Usá C, D, E, F, G, A, B con # o b.`);

  return { nota, sufijo, indice, usaFlat };
}

export function transposicionAcordes(i: Inputs): Outputs {
  const semitonos = Number(i.semitonos);
  if (!i.acorde || i.acorde.trim() === '') throw new Error('Ingresá un acorde');
  if (isNaN(semitonos)) throw new Error('Ingresá los semitonos');

  const { nota, sufijo, indice, usaFlat } = parseNota(i.acorde);
  const nuevoIndice = ((indice + semitonos) % 12 + 12) % 12;
  const escala = usaFlat ? NOTAS_FLAT : NOTAS_SHARP;
  const nuevaNota = escala[nuevoIndice];
  const acordeTranspuesto = nuevaNota + sufijo;
  const intervaloAbs = ((semitonos % 12) + 12) % 12;

  const acordeOriginal = i.acorde.trim();
  const nSemi = Math.abs(semitonos);
  const direccion = semitonos > 0 ? 'subiendo' : semitonos < 0 ? 'bajando' : 'sin mover';
  const intervaloTxt = INTERVALOS[intervaloAbs] || `${nSemi} semitonos`;
  const insight = {
    title: `${acordeOriginal} → ${acordeTranspuesto}`,
    text: semitonos === 0
      ? `Sin transposición: el acorde queda en **${acordeTranspuesto}**.`
      : `Transponiendo **${acordeOriginal}** ${nSemi} semitono(s) ${direccion} obtenés **${acordeTranspuesto}** (un intervalo de **${intervaloTxt}**). El sufijo del acorde no cambia, solo la fundamental.`,
    tone: 'neutral',
    icon: '🎸',
  };

  return {
    acordeTranspuesto,
    intervalo: intervaloTxt,
    notaOriginal: nota,
    notaNueva: nuevaNota,
    _insight: insight,
  };
}
