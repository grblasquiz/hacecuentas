/** Numerología del nombre — Expresión, Alma, Personalidad */
export interface Inputs { nombreCompleto: string; }
export interface Outputs { expresion: number; alma: number; personalidad: number; mensaje: string; }

const VOCALES = new Set('aeiou');
function val(ch: string): number { return ((ch.charCodeAt(0) - 96) % 9) || 9; }
function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22) n = String(n).split('').reduce((a,b) => a+Number(b), 0);
  return n;
}

const MSGS: Record<number, string> = {
  1:'Líder, independiente, pionero/a.',2:'Diplomático/a, cooperativo/a, sensible.',
  3:'Comunicador/a, creativo/a, alegre.',4:'Constructor/a, organizado/a, estable.',
  5:'Aventurero/a, libre, dinámico/a.',6:'Cuidador/a, responsable, amoroso/a.',
  7:'Pensador/a, espiritual, analítico/a.',8:'Ejecutivo/a, poderoso/a, ambicioso/a.',
  9:'Humanitario/a, sabio/a, compasivo/a.',11:'Intuitivo/a, inspirador/a, visionario/a.',
  22:'Constructor/a maestro/a, visionario/a con capacidad de materializar.'
};

export function numerologiaNombre(i: Inputs): Outputs {
  const raw = String(i.nombreCompleto || '').trim();
  if (!raw) throw new Error('Ingresá tu nombre completo');
  const clean = raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
  if (!clean) throw new Error('El nombre debe contener letras');

  let sumAll = 0, sumVow = 0, sumCon = 0;
  for (const ch of clean) {
    const v = val(ch);
    sumAll += v;
    if (VOCALES.has(ch)) sumVow += v;
    else sumCon += v;
  }

  const expresion = reduce(sumAll);
  const alma = reduce(sumVow);
  const personalidad = reduce(sumCon);

  const msg = `Expresión ${expresion}: ${MSGS[expresion] || ''} | Alma ${alma}: desea ${MSGS[alma]?.toLowerCase() || 'equilibrio'} | Personalidad ${personalidad}: imagen de ${MSGS[personalidad]?.toLowerCase() || 'balance'}`;

  return { expresion, alma, personalidad, mensaje: msg };
}
