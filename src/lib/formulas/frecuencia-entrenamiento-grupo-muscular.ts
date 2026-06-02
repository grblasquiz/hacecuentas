export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function frecuenciaEntrenamientoGrupoMuscular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const nivEs: Record<string, string> = { principiante: '3 (full body)', intermedio: '2-3 por grupo', avanzado: '3-4 por grupo' };
  const nivEn: Record<string, string> = { principiante: '3 (full body)', intermedio: '2-3 per muscle group', avanzado: '3-4 per muscle group' };
  const n = String(i.nivel);
  const freqEs = nivEs[n] || '2x';
  const freqEn = nivEn[n] || '2x';
  const freq = __lang === 'en' ? freqEn : freqEs;
  const resumen = __lang === 'en'
    ? `Frequency: ${freqEn} for level ${n}.`
    : `Frecuencia: ${freqEs} para nivel ${n}.`;
  const insTitle = __lang === 'en' ? 'Optimal weekly frequency' : 'Frecuencia semanal óptima';
  const insText = __lang === 'en'
    ? `For a **${n}** lifter, hitting each muscle **${freqEn}** maximizes weekly stimulus without piling up fatigue. Spread the volume across sessions instead of crushing one group in a single day.`
    : `Para nivel **${n}**, estimular cada músculo **${freqEs}** maximiza el estímulo semanal sin acumular fatiga. Repartí el volumen entre sesiones en vez de reventar un grupo en un solo día.`;
  return {
    frecuencia: freq, resumen,
    _insight: { title: insTitle, text: insText, tone: 'good', icon: '💪' },
  };
}
