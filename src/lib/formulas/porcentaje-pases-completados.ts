/** % pases completados con benchmarks por posicion (top 5 ligas europeas) */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

export function porcentajePasesCompletados(i: Inputs): Outputs {
  const completados = Number(i.pasesCompletados) || 0;
  const intentados = Number(i.pasesIntentados) || 0;
  const posicion = String(i.posicion || 'mediocampista');

  if (intentados <= 0) throw new Error('Ingresá pases intentados');
  if (completados > intentados) throw new Error('Los completados no pueden superar los intentados');

  const pct = (completados / intentados) * 100;

  // Benchmarks top 5 ligas (FBref, 2023-2025)
  const bench: Record<string, { elite: number; medio: number; bajo: number }> = {
    portero: { elite: 85, medio: 78, bajo: 70 },
    defensor: { elite: 92, medio: 86, bajo: 78 },
    'lateral': { elite: 88, medio: 82, bajo: 74 },
    mediocampista: { elite: 90, medio: 85, bajo: 78 },
    'mediapunta': { elite: 85, medio: 78, bajo: 70 },
    extremo: { elite: 82, medio: 75, bajo: 68 },
    delantero: { elite: 80, medio: 72, bajo: 65 },
  };
  const b = bench[posicion] ?? bench.mediocampista;

  const nivel = pct >= b.elite ? 'Elite top 5 ligas'
    : pct >= b.medio ? 'Sobre el promedio'
    : pct >= b.bajo ? 'Promedio / bajo'
    : 'Muy bajo para la posición';

  const pctFix = Number(pct.toFixed(1));
  const tone = pct >= b.medio ? 'good' : pct >= b.bajo ? 'neutral' : 'warn';
  const insightTexto = pct >= b.elite
    ? `**${pctFix}%** de acierto: nivel **elite** de ${posicion} en las top 5 ligas (umbral ${b.elite}%).`
    : pct >= b.medio
      ? `**${pctFix}%** te ubica **sobre el promedio** de ${posicion} (medio ${b.medio}%), buen registro de circulación.`
      : pct >= b.bajo
        ? `**${pctFix}%** es un nivel **promedio/bajo** para ${posicion}: por encima de ${b.bajo}% pero lejos del medio (${b.medio}%).`
        : `**${pctFix}%** queda por debajo del piso de ${posicion} (${b.bajo}%): margen claro para mejorar la precisión de pase.`;
  const _insight = { title: `Precisión de pase: ${nivel}`, text: insightTexto, tone, icon: '⚽' };
  const _chart = {
    type: 'scale',
    marker: pctFix,
    markerLabel: `${pctFix}%`,
    min: Math.max(0, Math.min(pctFix, Math.floor(b.bajo) - 10)),
    segments: [
      { nombre: 'Muy bajo', max: b.bajo, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Promedio/bajo', max: b.medio, color: '#eab308', colorDark: '#ca8a04' },
      { nombre: 'Sobre promedio', max: b.elite, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Elite', max: 100, color: '#10b981', colorDark: '#059669' },
    ],
    ariaLabel: `Precisión de pase ${pctFix}% para ${posicion}, nivel ${nivel}`,
  };
  return {
    porcentajeCompletado: `${pct.toFixed(1)}%`,
    pasesCompletadosNum: `${completados} de ${intentados}`,
    nivelComparativo: nivel,
    benchmarkPosicion: `Elite ${posicion}: ${b.elite}% — Medio: ${b.medio}% — Bajo: ${b.bajo}%`,
    interpretacion: `${completados} completados sobre ${intentados} intentados = ${pct.toFixed(1)}%. Para ${posicion}, ${nivel.toLowerCase()}.`,
    _insight,
    _chart,
  };
}
