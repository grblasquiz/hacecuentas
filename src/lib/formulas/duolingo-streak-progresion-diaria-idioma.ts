export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function duolingoStreakProgresionDiariaIdioma(i: Inputs): Outputs {
  const d=Number(i.dias)||0;
  let n:string;
  if (d<30) n='A1 parcial'; else if (d<180) n='A1 completo'; else if (d<365) n='A2 parcial'; else if (d<730) n='A2-B1'; else n='B1 máximo';

  const meses = Math.floor(d / 30);
  const mesesTxt = meses >= 1 ? `${meses} mes${meses === 1 ? '' : 'es'}` : `${d} días`;
  const tone: 'good' | 'warn' | 'neutral' = d >= 365 ? 'good' : d < 30 ? 'warn' : 'neutral';
  const cierre = d >= 730
    ? 'Para pasar de B1 ya no alcanza Duolingo: sumá conversación real e inmersión.'
    : 'Complementá con conversación para fijar lo aprendido.';
  const _insight = {
    title: 'Tu racha en nivel real',
    text: `Una racha de **${d} días** (${mesesTxt}) te ubica en torno a **${n}** del MCER. ${cierre}`,
    tone,
    icon: '🔥',
  };

  const _chart = {
    type: 'scale' as const,
    marker: d,
    markerLabel: `${d} días`,
    min: 0,
    unit: 'días',
    segments: [
      { nombre: 'A1 parcial', max: 30, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'A1 completo', max: 180, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'A2 parcial', max: 365, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'A2-B1', max: 730, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'B1 máx.', max: Math.max(900, d + 1), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: `Escala del nivel MCER aproximado según los días de racha en Duolingo, racha actual ${d} días.`,
  };

  return { nivelAprox:n, realidad:'Duo solo no lleva más allá de B1', resumen:`${d} días racha ≈ ${n}. Complementar con conversación.`, _insight, _chart };
}
