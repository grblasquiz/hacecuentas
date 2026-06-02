/** Score IELTS para tu Band Objetivo */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  promedio: number;
  _chart?: any;
  _insight?: any;
}

export function scoreIeltsBandObjetivo(i: Inputs): Outputs {
  const band = Number(i.bandObjetivo) || 7;
  const debil = String(i.seccionDebil || 'ninguna');

  // Si parejo, todas igual al band objetivo
  // Si débil, bajamos 0.5 a esa y subimos 0.5 a las otras dos para mantener promedio
  let L = band, R = band, W = band, S = band;

  if (debil === 'listening') { L = band - 0.5; R = band + 0.5; }
  else if (debil === 'reading') { R = band - 0.5; L = band + 0.5; }
  else if (debil === 'writing') { W = band - 0.5; L = band + 0.5; R = band + 0.5; }
  else if (debil === 'speaking') { S = band - 0.5; L = band + 0.5; R = band + 0.5; }

  const promedio = Math.round(((L + R + W + S) / 4) * 100) / 100;

  const nombreSeccion: Record<string, string> = {
    listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking',
  };

  // Nivel descriptivo según band promedio (escala IELTS)
  let nivel = '';
  if (promedio >= 8) nivel = 'usuario muy bueno / experto';
  else if (promedio >= 7) nivel = 'buen usuario';
  else if (promedio >= 6) nivel = 'usuario competente';
  else if (promedio >= 5) nivel = 'usuario modesto';
  else nivel = 'usuario básico';

  const insightText = debil !== 'ninguna' && nombreSeccion[debil]
    ? `Para un band promedio de **${promedio}** (${nivel}), tu plan asume que **${nombreSeccion[debil]}** es tu sección floja (**${[L, R, W, S][['listening', 'reading', 'writing', 'speaking'].indexOf(debil)]}**) y la compensás subiendo las demás. Concentrá el estudio ahí.`
    : `Apuntás a un band **${promedio}** parejo en las 4 secciones (${nivel}). Mantené todas equilibradas: la nota final es el promedio de Listening, Reading, Writing y Speaking.`;

  const chart = {
    type: 'scale' as const,
    marker: promedio,
    markerLabel: 'Tu band: ' + promedio,
    min: 4,
    unit: '',
    segments: [
      { nombre: 'Modesto', max: 6, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Competente', max: 7, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Bueno', max: 8, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Experto', max: Math.max(9, Math.ceil(promedio)), color: '#bfdbfe', colorDark: '#1e40af' },
    ],
    ariaLabel: 'Escala de bands IELTS: modesto, competente, bueno y experto.',
  };

  return {
    listening: L,
    reading: R,
    writing: W,
    speaking: S,
    promedio,
    _chart: chart,
    _insight: {
      title: 'Tu estrategia de bands',
      text: insightText,
      tone: 'neutral',
      icon: '🎓',
    },
  };

}
