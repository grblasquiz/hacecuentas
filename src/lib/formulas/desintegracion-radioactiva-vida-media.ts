export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function desintegracionRadioactivaVidaMedia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tm = Number(i.tMedia); const t = Number(i.t);
  if (!tm || t === undefined) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá');
  const pct = Math.pow(0.5, t / tm) * 100;
  const resumen = __lang === 'en'
    ? `After ${t} years, ${pct.toFixed(1)}% remains (${(t/tm).toFixed(1)} half-lives of ${tm}y).`
    : `Tras ${t} años quedan ${pct.toFixed(1)}% (${(t/tm).toFixed(1)} vidas medias de ${tm}a).`;
  return { porcentaje: pct.toFixed(2) + '%', resumen };
}
