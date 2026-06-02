export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function volumenSemanalSeriesGrupoMuscular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const grupo = String(i.grupo); const nivel = String(i.nivel);
  const MEV: Record<string, Record<string, number>> = { pecho: {principiante: 8, intermedio: 10, avanzado: 12}, espalda: {principiante: 10, intermedio: 12, avanzado: 14}, piernas: {principiante: 10, intermedio: 12, avanzado: 14}, brazos: {principiante: 6, intermedio: 8, avanzado: 10} };
  const MRV: Record<string, Record<string, number>> = { pecho: {principiante: 15, intermedio: 22, avanzado: 28}, espalda: {principiante: 18, intermedio: 25, avanzado: 30}, piernas: {principiante: 16, intermedio: 22, avanzado: 26}, brazos: {principiante: 10, intermedio: 16, avanzado: 20} };
  const seriesSem = __lang === 'en' ? ' sets/wk' : ' series/sem';
  const mevV = MEV[grupo]?.[nivel]; const mrvV = MRV[grupo]?.[nivel];
  const out: Outputs = { mev: mevV + seriesSem, mrv: mrvV + seriesSem,
    resumen: __lang === 'en'
      ? `${grupo} ${nivel}: MEV ${mevV} sets, MRV ${mrvV} sets/wk.`
      : `${grupo} ${nivel}: MEV ${mevV} series, MRV ${mrvV} series/sem.` };
  if (Number.isFinite(mevV) && Number.isFinite(mrvV)) {
    out._insight = {
      title: __lang === 'en' ? 'Your productive range' : 'Tu rango productivo',
      text: __lang === 'en'
        ? `For **${grupo}** at a **${nivel}** level, keep weekly volume between **${mevV} sets** (minimum to grow) and **${mrvV} sets** (recovery ceiling). Start near the lower end and add sets only as you adapt.`
        : `Para **${grupo}** con nivel **${nivel}**, mantené el volumen semanal entre **${mevV} series** (mínimo para crecer) y **${mrvV} series** (techo de recuperación). Arrancá cerca del piso y sumá series sólo a medida que te adaptás.`,
      tone: 'good',
      icon: '🏋️',
    };
    out._chart = {
      type: 'scale',
      marker: mevV,
      markerLabel: __lang === 'en' ? `${mevV} (MEV)` : `${mevV} (MEV)`,
      min: 0,
      segments: [
        { nombre: __lang === 'en' ? 'Maintenance' : 'Mantenimiento', max: mevV, color: '#fcd34d', colorDark: '#78350f' },
        { nombre: __lang === 'en' ? 'Productive (MEV–MRV)' : 'Productivo (MEV–MRV)', max: mrvV, color: '#86efac', colorDark: '#14532d' },
        { nombre: __lang === 'en' ? 'Overtraining' : 'Sobreentrenamiento', max: mrvV + 6, color: '#fca5a5', colorDark: '#7f1d1d' },
      ],
      ariaLabel: __lang === 'en'
        ? `Minimum effective volume of ${mevV} sets, with a productive range up to the MRV of ${mrvV} sets per week.`
        : `Volumen mínimo efectivo de ${mevV} series, con rango productivo hasta el MRV de ${mrvV} series por semana.`,
    };
  }
  return out;
}
