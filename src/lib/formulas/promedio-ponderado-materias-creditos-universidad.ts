export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function promedioPonderadoMateriasCreditosUniversidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;

  const prom = Math.round(r * 100) / 100;
  // Interpretación del promedio ponderado en escala 0-10 (estándar universitario AR)
  let cat: string, catEn: string, tone: 'good' | 'warn' | 'neutral';
  if (prom < 4) { cat = 'desaprobatorio'; catEn = 'failing'; tone = 'warn'; }
  else if (prom < 6) { cat = 'a recuperar'; catEn = 'needs work'; tone = 'warn'; }
  else if (prom < 8) { cat = 'aprobado'; catEn = 'solid pass'; tone = 'neutral'; }
  else { cat = 'distinguido'; catEn = 'distinguished'; tone = 'good'; }

  const _insight = {
    title: __lang === 'en' ? 'Your weighted average' : 'Tu promedio ponderado',
    text: __lang === 'en'
      ? `Your weighted average is **${prom.toFixed(2)}** out of 10 — a **${catEn}** level. Courses with more credits pull this number harder than the ones with fewer.`
      : `Tu promedio ponderado es **${prom.toFixed(2)}** sobre 10 — nivel **${cat}**. Las materias con más créditos pesan más que las de pocos créditos, así que mejorar esas mueve más la aguja.`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'scale' as const,
    marker: prom,
    markerLabel: prom.toFixed(2),
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Failing' : 'Desaprobado', max: 4, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: __lang === 'en' ? 'Needs work' : 'A recuperar', max: 6, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: __lang === 'en' ? 'Pass' : 'Aprobado', max: 8, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: __lang === 'en' ? 'Distinguished' : 'Distinguido', max: 10, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: __lang === 'en' ? 'Weighted average on a 0 to 10 scale' : 'Promedio ponderado en escala de 0 a 10',
  };

  return { resultado:r.toFixed(2), resumen, _insight, _chart };
}
