/** % de goles marcados después del minuto 90 (tiempo añadido / late goals). */
export interface Inputs {
  competencia: 'premier' | 'laliga' | 'seriea' | 'bundesliga' | 'ligue1' | 'ar-profesional' | 'champions' | 'mundial-2022' | 'mundial-2018';
}
export interface Outputs {
  competenciaLabel: string;
  porcentajeGolesPost90: number;
  golesPost90Referencia: number;
  totalGolesReferencia: number;
  contextoPartido: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

// Datos 2022-25 Opta / FBref. El Mundial 2022 (Qatar) marcó récord por el añadido extendido (~10-12 min/tiempo).
const TABLA: Record<string, { label: string; pct: number; golesPost90: number; total: number; contexto: string }> = {
  premier:          { label: 'Premier League 2024-25',     pct: 9.8,  golesPost90: 108, total: 1104, contexto: 'Añadidos extendidos desde VAR / regla FIFA 2022.' },
  laliga:           { label: 'LaLiga 2024-25',             pct: 8.6,  golesPost90: 88,  total: 1022, contexto: 'Tiempos añadidos más cortos que Premier.' },
  seriea:           { label: 'Serie A 2024-25',            pct: 9.2,  golesPost90: 92,  total: 1000, contexto: 'Añadido promedio 7-9 minutos.' },
  bundesliga:       { label: 'Bundesliga 2024-25',         pct: 10.1, golesPost90: 98,  total: 970,  contexto: 'Liga con mayor intensidad final en top-5.' },
  ligue1:           { label: 'Ligue 1 2024-25',            pct: 8.4,  golesPost90: 70,  total: 834,  contexto: 'Menor presión final en el formato 18 clubes.' },
  'ar-profesional': { label: 'Liga Profesional AR 2024',   pct: 11.3, golesPost90: 95,  total: 840,  contexto: 'Argentina lidera por la dramatización histórica + añadidos generosos.' },
  champions:        { label: 'UEFA Champions League 2024-25', pct: 12.7, golesPost90: 52, total: 410, contexto: 'Finales tensas, eliminatorias con reversiones tardías.' },
  'mundial-2022':   { label: 'Mundial FIFA Qatar 2022',    pct: 23.4, golesPost90: 40,  total: 172,  contexto: 'RÉCORD histórico: regla FIFA exigió añadir tiempo de detenciones (~10 min/tiempo).' },
  'mundial-2018':   { label: 'Mundial FIFA Rusia 2018',    pct: 9.3,  golesPost90: 16,  total: 169,  contexto: 'Pre-regla nueva, añadidos estándar (3-5 min).' },
};

export function golesTiempoAnadido(i: Inputs): Outputs {
  const fila = TABLA[i.competencia];
  if (!fila) throw new Error('Competencia inválida.');
  const golesAntes = fila.total - fila.golesPost90;
  return {
    competenciaLabel: fila.label,
    porcentajeGolesPost90: fila.pct,
    golesPost90Referencia: fila.golesPost90,
    totalGolesReferencia: fila.total,
    contextoPartido: fila.contexto,
    mensaje: `${fila.label}: ${fila.pct}% de los goles llegan después del minuto 90 (${fila.golesPost90}/${fila.total}).`,
    _insight: {
      title: `1 de cada ${Math.round(100 / fila.pct)} goles, tras el 90'`,
      text: `En ${fila.label}, **${fila.pct}%** de los goles (${fila.golesPost90} de ${fila.total}) caen en el tiempo añadido. ${fila.contexto} Nunca te vayas antes del pitazo final.`,
      tone: 'neutral',
      icon: '⏱️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Después del 90\'', value: fila.golesPost90 },
        { label: 'En los 90\'', value: golesAntes },
      ],
      centerValue: `${fila.pct}%`,
      centerLabel: 'tras el 90\'',
      ariaLabel: `De ${fila.total} goles, ${fila.golesPost90} después del minuto 90 y ${golesAntes} dentro de los 90 minutos`,
    },
  };
}
