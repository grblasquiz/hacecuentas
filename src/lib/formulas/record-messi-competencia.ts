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
  _insight?: any;
  _chart?: any;
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
  const shareR = Math.round(share * 10) / 10;
  const esTotal = i.competencia === 'total-carrera';

  const insight = {
    title: 'Lo que dicen los números',
    text: esTotal
      ? `En toda su carrera oficial Messi lleva **${fila.goles} goles** en **${fila.partidos} partidos**, un promedio de **${ppp.toFixed(2)} goles por partido** sostenido desde ${fila.periodo.replace('–', ' a ')}.`
      : `En ${fila.label} marcó **${fila.goles} goles** en **${fila.partidos} partidos** (**${ppp.toFixed(2)} g/p**), que representan el **${shareR}%** de los ${career} goles de toda su carrera.`,
    tone: 'good' as const,
    icon: '⚽',
  };

  // Donut: aporte de esta etapa al total de carrera (slices suman el total career)
  const resto = career - fila.goles;
  const chart = (!esTotal && resto > 0) ? {
    type: 'doughnut' as const,
    slices: [
      { label: fila.label, value: fila.goles },
      { label: 'Resto de la carrera', value: resto },
    ],
    centerValue: String(career),
    centerLabel: 'goles carrera',
    ariaLabel: `Goles de Messi en ${fila.label} (${fila.goles}) frente al resto de su carrera (${resto}), sobre un total de ${career}.`,
  } : undefined;

  return {
    competenciaLabel: fila.label,
    goles: fila.goles,
    partidos: fila.partidos,
    promedioPorPartido: Math.round(ppp * 1000) / 1000,
    periodo: fila.periodo,
    shareCarrera: shareR,
    mensaje: `${fila.label}: ${fila.goles} goles en ${fila.partidos} partidos (${ppp.toFixed(2)} g/p) durante ${fila.periodo}.`,
    _insight: insight,
    _chart: chart,
  };
}
