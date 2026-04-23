/** Records de goles de Lionel Messi por club y selección (estadística pura). */
export interface Inputs {
  competencia: 'barcelona' | 'psg' | 'inter-miami' | 'seleccion-argentina' | 'total-carrera';
}
export interface Outputs {
  competenciaLabel: string;
  goles: number;
  partidos: number;
  promedioPorPartido: number;
  periodo: string;
  shareCarrera: number; // % sobre ~870 goles career
  mensaje: string;
}

const TABLA: Record<string, { label: string; goles: number; partidos: number; periodo: string }> = {
  'barcelona':           { label: 'FC Barcelona',         goles: 672, partidos: 778, periodo: '2004–2021' },
  'psg':                 { label: 'Paris Saint-Germain',  goles: 32,  partidos: 75,  periodo: '2021–2023' },
  'inter-miami':         { label: 'Inter Miami CF',       goles: 45,  partidos: 62,  periodo: '2023–presente' },
  'seleccion-argentina': { label: 'Selección Argentina',  goles: 112, partidos: 191, periodo: '2005–presente' },
  'total-carrera':       { label: 'Carrera completa (oficial)', goles: 870, partidos: 1106, periodo: '2004–presente' },
};

export function recordMessiCompetencia(i: Inputs): Outputs {
  const fila = TABLA[i.competencia];
  if (!fila) throw new Error('Competencia inválida.');
  const career = TABLA['total-carrera'].goles;
  const share = (fila.goles / career) * 100;
  const ppp = fila.goles / fila.partidos;
  return {
    competenciaLabel: fila.label,
    goles: fila.goles,
    partidos: fila.partidos,
    promedioPorPartido: Math.round(ppp * 1000) / 1000,
    periodo: fila.periodo,
    shareCarrera: Math.round(share * 10) / 10,
    mensaje: `${fila.label}: ${fila.goles} goles en ${fila.partidos} partidos (${ppp.toFixed(2)} g/p) durante ${fila.periodo}.`,
  };
}
