/** Top 10 goleadores históricos de Copas del Mundo FIFA (hombres). */
export interface Inputs {
  jugador: 'klose' | 'ronaldo-bra' | 'muller' | 'messi' | 'fontaine' | 'mbappe' | 'pele' | 'kocsis' | 'lineker' | 'seeler';
}
export interface Outputs {
  jugadorLabel: string;
  pais: string;
  goles: number;
  mundialesDisputados: number;
  periodo: string;
  promedioPorMundial: number;
  ranking: number;
  mensaje: string;
}

// Ranking histórico (a marzo 2026). Messi y Mbappé con 13 y 12 respectivamente tras Qatar 2022.
const TABLA: Record<string, { label: string; pais: string; goles: number; mundiales: number; periodo: string; rank: number }> = {
  'klose':       { label: 'Miroslav Klose',      pais: 'Alemania',   goles: 16, mundiales: 4, periodo: '2002–2014', rank: 1 },
  'ronaldo-bra': { label: 'Ronaldo (Nazário)',   pais: 'Brasil',     goles: 15, mundiales: 4, periodo: '1994–2006', rank: 2 },
  'muller':      { label: 'Gerd Müller',         pais: 'Alemania',   goles: 14, mundiales: 2, periodo: '1970–1974', rank: 3 },
  'fontaine':    { label: 'Just Fontaine',       pais: 'Francia',    goles: 13, mundiales: 1, periodo: '1958',      rank: 4 },
  'messi':       { label: 'Lionel Messi',        pais: 'Argentina',  goles: 13, mundiales: 5, periodo: '2006–2022', rank: 5 },
  'mbappe':      { label: 'Kylian Mbappé',       pais: 'Francia',    goles: 12, mundiales: 2, periodo: '2018–2022', rank: 6 },
  'pele':        { label: 'Pelé',                pais: 'Brasil',     goles: 12, mundiales: 4, periodo: '1958–1970', rank: 7 },
  'kocsis':      { label: 'Sándor Kocsis',       pais: 'Hungría',    goles: 11, mundiales: 1, periodo: '1954',      rank: 8 },
  'lineker':     { label: 'Gary Lineker',        pais: 'Inglaterra', goles: 10, mundiales: 2, periodo: '1986–1990', rank: 9 },
  'seeler':      { label: 'Uwe Seeler',          pais: 'Alemania',   goles: 9,  mundiales: 4, periodo: '1958–1970', rank: 10 },
};

export function topGoleadoresMundial(i: Inputs): Outputs {
  const fila = TABLA[i.jugador];
  if (!fila) throw new Error('Jugador inválido.');
  const prom = fila.goles / fila.mundiales;
  return {
    jugadorLabel: fila.label,
    pais: fila.pais,
    goles: fila.goles,
    mundialesDisputados: fila.mundiales,
    periodo: fila.periodo,
    promedioPorMundial: Math.round(prom * 100) / 100,
    ranking: fila.rank,
    mensaje: `#${fila.rank} ${fila.label} (${fila.pais}): ${fila.goles} goles en ${fila.mundiales} Mundial(es) (${prom.toFixed(2)} g/Mundial).`,
  };
}
