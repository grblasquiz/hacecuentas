export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function velocidadNatacionPace100m(i: Inputs): Outputs {
  const m = Number(i.metros) || 100; const min = Number(i.minutos) || 0; const s = Number(i.segundos) || 0;
  const tSec = min * 60 + s;
  const paceSec = tSec / (m / 100);
  const mm = Math.floor(paceSec / 60); const ss = Math.round(paceSec % 60);
  const paceLabel = `${mm}:${String(ss).padStart(2, '0')}`;
  const insight = paceSec > 0 ? {
    title: 'Tu pace en la pileta',
    text: `Tu ritmo es de **${paceLabel} por 100m**` + (tSec > 0 && m > 0 ? `, lo que equivale a **${(m / tSec * 3.6).toFixed(2)} km/h** en el agua.` : '.'),
    tone: 'neutral',
    icon: '🏊',
  } : undefined;
  return { paceMin100: paceLabel, resumen: `Pace ${paceLabel} por 100m.`, _insight: insight };
}
