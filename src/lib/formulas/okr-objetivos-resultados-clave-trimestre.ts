export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function okrObjetivosResultadosClaveTrimestre(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;

  const pct = Math.round(r * 100);
  // Zonas OKR: <40% fuera de rumbo, 40-70% en progreso, 70-100% en el objetivo, >100% superado
  let zonaTxt: string, tone: 'good' | 'warn' | 'neutral';
  if (r < 0.4) { zonaTxt = 'fuera de rumbo'; tone = 'warn'; }
  else if (r < 0.7) { zonaTxt = 'en progreso, con riesgo'; tone = 'warn'; }
  else if (r <= 1) { zonaTxt = 'en zona objetivo'; tone = 'good'; }
  else { zonaTxt = 'objetivo superado'; tone = 'good'; }

  const _insight = {
    title: 'Avance del Key Result',
    text: `Con **${v1}** sobre una meta de **${v2}**, el avance es **${pct}%** (score **${r.toFixed(2)}**): estás **${zonaTxt}**. En OKR un score de 0,7 a 1,0 se considera el rango sano.`,
    tone,
    icon: '🎯',
  };

  // Gauge sobre la escala 0–1 del score OKR (el último tramo supera el marker siempre)
  const lastMax = Math.max(1, Number((r + 0.01).toFixed(2)));
  const _chart = {
    type: 'scale' as const,
    marker: Number(r.toFixed(2)),
    markerLabel: `${r.toFixed(2)} (${pct}%)`,
    min: 0,
    segments: [
      { nombre: 'Fuera de rumbo', max: 0.4, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'En progreso', max: 0.7, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'En objetivo', max: lastMax, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `Score OKR de ${r.toFixed(2)} sobre 1, ${zonaTxt}`,
  };

  return { resultado:r.toFixed(2), resumen:`Score del Key Result: ${r.toFixed(2)} — alcanzaste ${v1} sobre una meta de ${v2}. El rango sano en OKR es 0,7 a 1,0.`, _insight, _chart };
}
