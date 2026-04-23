/** Home advantage — % histórico de victorias de local por liga. */
export interface Inputs {
  liga: 'premier' | 'laliga' | 'seriea' | 'bundesliga' | 'ligue1' | 'brasileirao' | 'ar-profesional' | 'mls';
}
export interface Outputs {
  ligaLabel: string;
  porcentajeVictoriasLocal: number;
  porcentajeEmpates: number;
  porcentajeVictoriasVisitante: number;
  diferencialLocalVisitante: number;
  mensaje: string;
}

// Promedios históricos 2010-2025 (FBref + Opta Analyst).
const TABLA: Record<string, { label: string; local: number; empate: number; visitante: number }> = {
  premier:          { label: 'Premier League (Inglaterra)',       local: 45, empate: 24, visitante: 31 },
  laliga:           { label: 'LaLiga (España)',                    local: 47, empate: 26, visitante: 27 },
  seriea:           { label: 'Serie A (Italia)',                   local: 49, empate: 27, visitante: 24 },
  bundesliga:       { label: 'Bundesliga (Alemania)',              local: 44, empate: 25, visitante: 31 },
  ligue1:           { label: 'Ligue 1 (Francia)',                  local: 46, empate: 27, visitante: 27 },
  brasileirao:      { label: 'Brasileirão Série A',                local: 53, empate: 25, visitante: 22 },
  'ar-profesional': { label: 'Liga Profesional AFA (Argentina)',   local: 50, empate: 28, visitante: 22 },
  mls:              { label: 'Major League Soccer (MLS)',          local: 48, empate: 24, visitante: 28 },
};

export function homeAdvantageLiga(i: Inputs): Outputs {
  const fila = TABLA[i.liga];
  if (!fila) throw new Error('Liga inválida.');
  const diff = fila.local - fila.visitante;
  return {
    ligaLabel: fila.label,
    porcentajeVictoriasLocal: fila.local,
    porcentajeEmpates: fila.empate,
    porcentajeVictoriasVisitante: fila.visitante,
    diferencialLocalVisitante: diff,
    mensaje: `${fila.label}: ${fila.local}% victorias locales vs ${fila.visitante}% visitantes (diferencial ${diff} pp).`,
  };
}
