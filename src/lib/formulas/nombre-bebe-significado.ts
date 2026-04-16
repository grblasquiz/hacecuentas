/** Buscador de significado de nombres de bebé */
export interface Inputs { nombreBuscar: string; }
export interface Outputs { significado: string; origen: string; popularidad: string; variantes: string; }

const nombres: Record<string, { sig: string; orig: string; pop: string; vars: string }> = {
  'emma': { sig: 'Universal, mujer industriosa, la que es grande', orig: 'Germánico', pop: 'Top 5 en Argentina (2020-2026)', vars: 'Ema, Emily, Emmanuelle, Emmy' },
  'olivia': { sig: 'La que protege la paz, olivo', orig: 'Latín', pop: 'Top 5 en Argentina', vars: 'Olive, Livia, Oliva' },
  'mia': { sig: 'La elegida, amada, mía', orig: 'Escandinavo / Hebreo', pop: 'Top 5 en Argentina', vars: 'Mía, Maya, Maia' },
  'isabella': { sig: 'Consagrada a Dios, bella', orig: 'Hebreo / Italiano', pop: 'Top 10 en Argentina', vars: 'Isabel, Bella, Isabelle' },
  'sofia': { sig: 'Sabiduría', orig: 'Griego', pop: 'Top 10 (clásico estable)', vars: 'Sofía, Sophie, Sophia' },
  'valentina': { sig: 'Valiente, fuerte, sana', orig: 'Latín', pop: 'Top 10 en Argentina', vars: 'Valentín, Vale, Tina' },
  'mateo': { sig: 'Don de Dios', orig: 'Hebreo', pop: 'Top 3 en Argentina (2020-2026)', vars: 'Matías, Matteo, Matthew' },
  'bautista': { sig: 'El que bautiza', orig: 'Griego', pop: 'Top 3 en Argentina', vars: 'Bauti, Baptiste, Juan Bautista' },
  'benicio': { sig: 'El bendecido, hombre de bien', orig: 'Latín', pop: 'Top 5 en Argentina (tendencia)', vars: 'Beni, Benito, Benedetto' },
  'noah': { sig: 'Descanso, consuelo', orig: 'Hebreo', pop: 'Top 10 (en ascenso)', vars: 'Noé, Noa' },
  'liam': { sig: 'Protector decidido, guerrero', orig: 'Irlandés', pop: 'Top 10 en Argentina', vars: 'William, Guillermo, Willy' },
  'ciro': { sig: 'El sol, señor', orig: 'Persa', pop: 'Top 10 en Argentina', vars: 'Cyrus, Kiro' },
  'felipe': { sig: 'Amante de los caballos', orig: 'Griego', pop: 'Top 15 (clásico en alza)', vars: 'Philip, Philippe, Filippo' },
  'valentino': { sig: 'Valiente, fuerte', orig: 'Latín / Italiano', pop: 'Top 10 en Argentina', vars: 'Valentín, Tino, Valente' },
  'lorenzo': { sig: 'Coronado de laureles, victorioso', orig: 'Latín', pop: 'Top 15 en Argentina', vars: 'Lorenz, Enzo, Renzo' },
  'thiago': { sig: 'El que suplanta, variante de Santiago', orig: 'Hebreo / Español', pop: 'Top 15 en Argentina', vars: 'Tiago, Santiago, Diego' },
  'catalina': { sig: 'Pura, casta', orig: 'Griego', pop: 'Top 10 en Argentina', vars: 'Cata, Catherine, Catalin, Katrina' },
  'alma': { sig: 'Alma, espíritu', orig: 'Latín', pop: 'Top 15 (en ascenso)', vars: 'Alma, Alima' },
  'delfina': { sig: 'La del delfín, de Delfos', orig: 'Griego / Latín', pop: 'Top 15 en Argentina', vars: 'Delfi, Delphine, Daphne' },
  'martina': { sig: 'Consagrada a Marte, guerrera', orig: 'Latín', pop: 'Top 10 en Argentina', vars: 'Marti, Martín, Tina' },
};

export function nombreBebeSignificado(i: Inputs): Outputs {
  const nombre = String(i.nombreBuscar || '').trim().toLowerCase();
  if (!nombre) throw new Error('Ingresá un nombre para buscar');

  const data = nombres[nombre];
  if (data) {
    return { significado: data.sig, origen: data.orig, popularidad: data.pop, variantes: data.vars };
  }

  // Búsqueda parcial
  const parcial = Object.keys(nombres).find(k => k.includes(nombre) || nombre.includes(k));
  if (parcial) {
    const d = nombres[parcial];
    return { significado: `(Resultado más cercano: ${parcial}) ${d.sig}`, origen: d.orig, popularidad: d.pop, variantes: d.vars };
  }

  return {
    significado: 'No encontramos este nombre en nuestra base de datos. Probá con otra variante.',
    origen: 'Desconocido',
    popularidad: 'Sin datos',
    variantes: 'Probá buscando variantes del nombre.',
  };
}
