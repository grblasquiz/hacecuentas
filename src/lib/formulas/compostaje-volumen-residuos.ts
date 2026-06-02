export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function compostajeVolumenResiduos(i: Inputs): Outputs {
  const kg = Number(i.kgSemana) || 0;
  const V = kg * 0.015 * 52;
  const kgAnio = Math.round(kg * 52);
  return {
    volumen: V.toFixed(2) + ' m³',
    resumen: `Compostero de ${V.toFixed(2)} m³ para ${kg} kg/semana de residuos.`,
    _insight: {
      title: 'Tamaño de tu compostera',
      text: `Con **${kg} kg/semana** generás unos **${kgAnio} kg/año** de residuos orgánicos: necesitás una compostera de al menos **${V.toFixed(2)} m³**. Como referencia, una compostera doméstica típica ronda 0,3-0,6 m³.`,
      tone: V > 0.6 ? 'warn' : 'good',
      icon: '🌱',
    },
  };
}
