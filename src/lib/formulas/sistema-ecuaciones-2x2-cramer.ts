export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }
export function sistemaEcuaciones2x2Cramer(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      singular: 'Sistema singular: sin solución única.',
      unica: (x: string, y: string) => `Solución única: x=${x}, y=${y}.`,
      insTitleOk: 'Solución del sistema',
      insTextOk: (x: string, y: string, det: string) => `El determinante es **${det}** (≠ 0), así que el sistema tiene **una única solución**: x = **${x}**, y = **${y}**. Las dos rectas se cruzan en ese punto.`,
      insTitleSing: 'Sin solución única',
      insTextSing: 'El **determinante es 0**: las rectas son paralelas o coincidentes, así que el sistema no tiene solución única (ninguna o infinitas). Revisá los coeficientes.',
    },
    en: {
      singular: 'Singular system: no unique solution.',
      unica: (x: string, y: string) => `Unique solution: x=${x}, y=${y}.`,
      insTitleOk: 'System solution',
      insTextOk: (x: string, y: string, det: string) => `The determinant is **${det}** (≠ 0), so the system has **one unique solution**: x = **${x}**, y = **${y}**. The two lines cross at that point.`,
      insTitleSing: 'No unique solution',
      insTextSing: 'The **determinant is 0**: the lines are parallel or coincident, so the system has no unique solution (none or infinitely many). Check the coefficients.',
    },
  } as const)[__lang];
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0; const e=Number(i.e)||0; const f=Number(i.f)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return { x:'—', y:'—', det:'0', resumen: T.singular, _insight: { title: T.insTitleSing, text: T.insTextSing, tone: 'warn', icon: '⚠️' } };
  const xVal=((e*d-b*f)/det).toFixed(3); const yVal=((a*f-e*c)/det).toFixed(3); const detVal=det.toFixed(2);
  return { x:xVal, y:yVal, det:detVal, resumen: T.unica(((e*d-b*f)/det).toFixed(2), ((a*f-e*c)/det).toFixed(2)), _insight: { title: T.insTitleOk, text: T.insTextOk(xVal, yVal, detVal), tone: 'good', icon: '📐' } };
}
