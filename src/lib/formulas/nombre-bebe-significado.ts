/** Buscador de significado de nombres de bebé */
export interface Inputs { nombreBuscar: string; __lang?: string; }
export interface Outputs { significado: string; origen: string; popularidad: string; variantes: string; }

const nombres: Record<string, { sig: string; orig: string; pop: string; vars: string; sigEn: string; origEn: string; popEn: string; varsEn: string }> = {
  'emma': { sig: 'Universal, mujer industriosa, la que es grande', orig: 'Germánico', pop: 'Top 5 en Argentina (2020-2026)', vars: 'Ema, Emily, Emmanuelle, Emmy', sigEn: 'Universal, industrious woman, the great one', origEn: 'Germanic', popEn: 'Top 5 in Argentina (2020-2026)', varsEn: 'Ema, Emily, Emmanuelle, Emmy' },
  'olivia': { sig: 'La que protege la paz, olivo', orig: 'Latín', pop: 'Top 5 en Argentina', vars: 'Olive, Livia, Oliva', sigEn: 'The one who protects peace, olive tree', origEn: 'Latin', popEn: 'Top 5 in Argentina', varsEn: 'Olive, Livia, Oliva' },
  'mia': { sig: 'La elegida, amada, mía', orig: 'Escandinavo / Hebreo', pop: 'Top 5 en Argentina', vars: 'Mía, Maya, Maia', sigEn: 'The chosen one, beloved, mine', origEn: 'Scandinavian / Hebrew', popEn: 'Top 5 in Argentina', varsEn: 'Mía, Maya, Maia' },
  'isabella': { sig: 'Consagrada a Dios, bella', orig: 'Hebreo / Italiano', pop: 'Top 10 en Argentina', vars: 'Isabel, Bella, Isabelle', sigEn: 'Consecrated to God, beautiful', origEn: 'Hebrew / Italian', popEn: 'Top 10 in Argentina', varsEn: 'Isabel, Bella, Isabelle' },
  'sofia': { sig: 'Sabiduría', orig: 'Griego', pop: 'Top 10 (clásico estable)', vars: 'Sofía, Sophie, Sophia', sigEn: 'Wisdom', origEn: 'Greek', popEn: 'Top 10 (stable classic)', varsEn: 'Sofía, Sophie, Sophia' },
  'valentina': { sig: 'Valiente, fuerte, sana', orig: 'Latín', pop: 'Top 10 en Argentina', vars: 'Valentín, Vale, Tina', sigEn: 'Brave, strong, healthy', origEn: 'Latin', popEn: 'Top 10 in Argentina', varsEn: 'Valentín, Vale, Tina' },
  'mateo': { sig: 'Don de Dios', orig: 'Hebreo', pop: 'Top 3 en Argentina (2020-2026)', vars: 'Matías, Matteo, Matthew', sigEn: 'Gift of God', origEn: 'Hebrew', popEn: 'Top 3 in Argentina (2020-2026)', varsEn: 'Matías, Matteo, Matthew' },
  'bautista': { sig: 'El que bautiza', orig: 'Griego', pop: 'Top 3 en Argentina', vars: 'Bauti, Baptiste, Juan Bautista', sigEn: 'The one who baptizes', origEn: 'Greek', popEn: 'Top 3 in Argentina', varsEn: 'Bauti, Baptiste, Juan Bautista' },
  'benicio': { sig: 'El bendecido, hombre de bien', orig: 'Latín', pop: 'Top 5 en Argentina (tendencia)', vars: 'Beni, Benito, Benedetto', sigEn: 'The blessed one, man of virtue', origEn: 'Latin', popEn: 'Top 5 in Argentina (trending)', varsEn: 'Beni, Benito, Benedetto' },
  'noah': { sig: 'Descanso, consuelo', orig: 'Hebreo', pop: 'Top 10 (en ascenso)', vars: 'Noé, Noa', sigEn: 'Rest, comfort', origEn: 'Hebrew', popEn: 'Top 10 (rising)', varsEn: 'Noé, Noa' },
  'liam': { sig: 'Protector decidido, guerrero', orig: 'Irlandés', pop: 'Top 10 en Argentina', vars: 'William, Guillermo, Willy', sigEn: 'Determined protector, warrior', origEn: 'Irish', popEn: 'Top 10 in Argentina', varsEn: 'William, Guillermo, Willy' },
  'ciro': { sig: 'El sol, señor', orig: 'Persa', pop: 'Top 10 en Argentina', vars: 'Cyrus, Kiro', sigEn: 'The sun, lord', origEn: 'Persian', popEn: 'Top 10 in Argentina', varsEn: 'Cyrus, Kiro' },
  'felipe': { sig: 'Amante de los caballos', orig: 'Griego', pop: 'Top 15 (clásico en alza)', vars: 'Philip, Philippe, Filippo', sigEn: 'Lover of horses', origEn: 'Greek', popEn: 'Top 15 (rising classic)', varsEn: 'Philip, Philippe, Filippo' },
  'valentino': { sig: 'Valiente, fuerte', orig: 'Latín / Italiano', pop: 'Top 10 en Argentina', vars: 'Valentín, Tino, Valente', sigEn: 'Brave, strong', origEn: 'Latin / Italian', popEn: 'Top 10 in Argentina', varsEn: 'Valentín, Tino, Valente' },
  'lorenzo': { sig: 'Coronado de laureles, victorioso', orig: 'Latín', pop: 'Top 15 en Argentina', vars: 'Lorenz, Enzo, Renzo', sigEn: 'Crowned with laurels, victorious', origEn: 'Latin', popEn: 'Top 15 in Argentina', varsEn: 'Lorenz, Enzo, Renzo' },
  'thiago': { sig: 'El que suplanta, variante de Santiago', orig: 'Hebreo / Español', pop: 'Top 15 en Argentina', vars: 'Tiago, Santiago, Diego', sigEn: 'The supplanter, variant of Santiago', origEn: 'Hebrew / Spanish', popEn: 'Top 15 in Argentina', varsEn: 'Tiago, Santiago, Diego' },
  'catalina': { sig: 'Pura, casta', orig: 'Griego', pop: 'Top 10 en Argentina', vars: 'Cata, Catherine, Catalin, Katrina', sigEn: 'Pure, chaste', origEn: 'Greek', popEn: 'Top 10 in Argentina', varsEn: 'Cata, Catherine, Catalin, Katrina' },
  'alma': { sig: 'Alma, espíritu', orig: 'Latín', pop: 'Top 15 (en ascenso)', vars: 'Alma, Alima', sigEn: 'Soul, spirit', origEn: 'Latin', popEn: 'Top 15 (rising)', varsEn: 'Alma, Alima' },
  'delfina': { sig: 'La del delfín, de Delfos', orig: 'Griego / Latín', pop: 'Top 15 en Argentina', vars: 'Delfi, Delphine, Daphne', sigEn: 'The dolphin girl, from Delphi', origEn: 'Greek / Latin', popEn: 'Top 15 in Argentina', varsEn: 'Delfi, Delphine, Daphne' },
  'martina': { sig: 'Consagrada a Marte, guerrera', orig: 'Latín', pop: 'Top 10 en Argentina', vars: 'Marti, Martín, Tina', sigEn: 'Consecrated to Mars, warrior', origEn: 'Latin', popEn: 'Top 10 in Argentina', varsEn: 'Marti, Martín, Tina' },
};

export function nombreBebeSignificado(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const nombre = String(i.nombreBuscar || '').trim().toLowerCase();
  if (!nombre) throw new Error(__lang === 'en' ? 'Enter a name to search' : 'Ingresá un nombre para buscar');

  const data = nombres[nombre];
  if (data) {
    return __lang === 'en'
      ? { significado: data.sigEn, origen: data.origEn, popularidad: data.popEn, variantes: data.varsEn }
      : { significado: data.sig, origen: data.orig, popularidad: data.pop, variantes: data.vars };
  }

  // Búsqueda parcial
  const parcial = Object.keys(nombres).find(k => k.includes(nombre) || nombre.includes(k));
  if (parcial) {
    const d = nombres[parcial];
    return __lang === 'en'
      ? { significado: `(Closest result: ${parcial}) ${d.sigEn}`, origen: d.origEn, popularidad: d.popEn, variantes: d.varsEn }
      : { significado: `(Resultado más cercano: ${parcial}) ${d.sig}`, origen: d.orig, popularidad: d.pop, variantes: d.vars };
  }

  return __lang === 'en'
    ? {
        significado: 'This name was not found in our database. Try a different variant.',
        origen: 'Unknown',
        popularidad: 'No data',
        variantes: 'Try searching for variants of the name.',
      }
    : {
        significado: 'No encontramos este nombre en nuestra base de datos. Probá con otra variante.',
        origen: 'Desconocido',
        popularidad: 'Sin datos',
        variantes: 'Probá buscando variantes del nombre.',
      };
}
