export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function desintegracionRadioactivaVidaMedia(i: Inputs): Outputs {
  const tm = Number(i.tMedia); const t = Number(i.t);
  if (!tm || t === undefined) throw new Error('Completá');
  const pct = Math.pow(0.5, t / tm) * 100;
  return { porcentaje: pct.toFixed(2) + '%', resumen: `Tras ${t} años quedan ${pct.toFixed(1)}% (${(t/tm).toFixed(1)} vidas medias de ${tm}a).` };
}
