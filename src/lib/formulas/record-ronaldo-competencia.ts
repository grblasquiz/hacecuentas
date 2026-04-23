/** Records de goles de Cristiano Ronaldo por club y selección (estadística pura). */
export interface Inputs {
  competencia: 'sporting' | 'etapa-premier-era' | 'real-madrid' | 'juventus' | 'al-nassr' | 'portugal' | 'total-carrera';
}
export interface Outputs {
  competenciaLabel: string;
  goles: number;
  partidos: number;
  promedioPorPartido: number;
  periodo: string;
  shareCarrera: number;
  mensaje: string;
}

// Se evita usar el nombre del club inglés por pedido editorial; se refiere como "etapa en Inglaterra (2003-09 y 2021-22)".
const TABLA: Record<string, { label: string; goles: number; partidos: number; periodo: string }> = {
  'sporting':              { label: 'Sporting CP',                      goles: 5,   partidos: 31,  periodo: '2002–2003' },
  'etapa-premier-era': { label: 'Etapa en Inglaterra (Premier)',    goles: 145, partidos: 346, periodo: '2003–2009 / 2021–2022' },
  'real-madrid':           { label: 'Real Madrid',                      goles: 450, partidos: 438, periodo: '2009–2018' },
  'juventus':              { label: 'Juventus',                         goles: 101, partidos: 134, periodo: '2018–2021' },
  'al-nassr':              { label: 'Al-Nassr',                         goles: 88,  partidos: 101, periodo: '2023–presente' },
  'portugal':              { label: 'Selección de Portugal',            goles: 135, partidos: 219, periodo: '2003–presente' },
  'total-carrera':         { label: 'Carrera completa (oficial)',       goles: 924, partidos: 1269, periodo: '2002–presente' },
};

export function recordRonaldoCompetencia(i: Inputs): Outputs {
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
