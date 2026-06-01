export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function volumenSemanalSeriesGrupoMuscular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const grupo = String(i.grupo); const nivel = String(i.nivel);
  const MEV: Record<string, Record<string, number>> = { pecho: {principiante: 8, intermedio: 10, avanzado: 12}, espalda: {principiante: 10, intermedio: 12, avanzado: 14}, piernas: {principiante: 10, intermedio: 12, avanzado: 14}, brazos: {principiante: 6, intermedio: 8, avanzado: 10} };
  const MRV: Record<string, Record<string, number>> = { pecho: {principiante: 15, intermedio: 22, avanzado: 28}, espalda: {principiante: 18, intermedio: 25, avanzado: 30}, piernas: {principiante: 16, intermedio: 22, avanzado: 26}, brazos: {principiante: 10, intermedio: 16, avanzado: 20} };
  const seriesSem = __lang === 'en' ? ' sets/wk' : ' series/sem';
  return { mev: MEV[grupo]?.[nivel] + seriesSem, mrv: MRV[grupo]?.[nivel] + seriesSem,
    resumen: __lang === 'en'
      ? `${grupo} ${nivel}: MEV ${MEV[grupo]?.[nivel]} sets, MRV ${MRV[grupo]?.[nivel]} sets/wk.`
      : `${grupo} ${nivel}: MEV ${MEV[grupo]?.[nivel]} series, MRV ${MRV[grupo]?.[nivel]} series/sem.` };
}
