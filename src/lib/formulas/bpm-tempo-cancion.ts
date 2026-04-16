/** Calculadora de BPM y Tempo */
export interface Inputs {
  metodo: string;
  valor: number;
  segundos?: number;
}
export interface Outputs {
  bpm: number;
  msPorBeat: number;
  msPorCompas: number;
  genero: string;
}

export function bpmTempoCancion(i: Inputs): Outputs {
  const valor = Number(i.valor);
  if (!valor || valor <= 0) throw new Error('Ingresá un valor válido');

  let bpm: number;

  switch (i.metodo) {
    case 'msPorBeat':
      bpm = 60000 / valor;
      break;
    case 'bpmAMs':
      bpm = valor;
      break;
    case 'beatsEnTiempo': {
      const seg = Number(i.segundos);
      if (!seg || seg <= 0) throw new Error('Ingresá los segundos');
      bpm = (valor / seg) * 60;
      break;
    }
    default:
      throw new Error('Seleccioná un método de cálculo');
  }

  if (bpm <= 0 || bpm > 300) throw new Error('BPM fuera de rango (1-300)');

  const msPorBeat = 60000 / bpm;
  const msPorCompas = msPorBeat * 4;

  let genero: string;
  if (bpm < 70) genero = 'Muy lento — Downtempo, Ambient, Balada lenta';
  else if (bpm < 90) genero = 'Lento — Hip-Hop, R&B, Reggae, Trap (half-time)';
  else if (bpm < 110) genero = 'Moderado — Reggaetón, Cumbia, Pop latino';
  else if (bpm < 125) genero = 'Medio — Pop, Indie, Funk';
  else if (bpm < 140) genero = 'Bailable — House, Techno, EDM, Trance';
  else if (bpm < 160) genero = 'Rápido — Hardstyle, Psytrance, Punk';
  else if (bpm < 180) genero = 'Muy rápido — Drum & Bass, Jungle';
  else genero = 'Extremo — Speedcore, Gabber';

  return {
    bpm: Number(bpm.toFixed(1)),
    msPorBeat: Number(msPorBeat.toFixed(1)),
    msPorCompas: Number(msPorCompas.toFixed(0)),
    genero,
  };
}
