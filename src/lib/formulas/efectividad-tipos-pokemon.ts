/** Pokémon type effectiveness calculator — Gen 6+ (18 tipos) */
export interface Inputs {
  atacante: string;
  defensor1: string;
  defensor2?: string; // tipo secundario opcional
}

export interface Outputs {
  multiplicador: number;
  efectividad: string;
  resumen: string;
}

type T = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

// Tabla de efectividad: CHART[atacante][defensor] = multiplicador
const CHART: Record<T, Partial<Record<T, number>>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

function mult(atk: T, def: T): number {
  return CHART[atk]?.[def] ?? 1;
}

export function efectividadTiposPokemon(i: Inputs): Outputs {
  const atk = String(i.atacante || '').toLowerCase() as T;
  const d1 = String(i.defensor1 || '').toLowerCase() as T;
  const d2raw = String(i.defensor2 || '').toLowerCase();
  const d2 = d2raw && d2raw !== 'none' && d2raw !== 'ninguno' ? (d2raw as T) : null;

  if (!CHART[atk]) throw new Error('Tipo atacante inválido');
  if (!CHART[d1]) throw new Error('Tipo defensor inválido');

  const m1 = mult(atk, d1);
  const m2 = d2 && CHART[d2] ? mult(atk, d2) : 1;
  const total = m1 * m2;

  let efec = '';
  if (total === 0) efec = 'Sin efecto (inmune)';
  else if (total === 0.25) efec = 'Cuarto — muy poco efectivo';
  else if (total === 0.5) efec = 'Poco efectivo';
  else if (total === 1) efec = 'Neutral (daño normal)';
  else if (total === 2) efec = 'Súper efectivo';
  else if (total === 4) efec = '¡Súper efectivo x4!';

  return {
    multiplicador: Number(total.toFixed(2)),
    efectividad: efec,
    resumen: `**${atk.toUpperCase()}** vs **${d1.toUpperCase()}${d2 ? '/' + d2.toUpperCase() : ''}** = **×${total}** — ${efec}.`,
  };
}
