export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function descansoPostMaratonRegla1DiaKm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km = Number(i.kmCarrera) || 0;
  const dias = Math.round(km / 2);
  const sem = Math.ceil(dias / 7);
  const resumen = __lang === 'en'
    ? `Recovery: ${dias} easy days (~${sem} weeks) after ${km}km.`
    : `Descanso: ${dias} días suaves (~${sem} semanas) post ${km}km.`;
  return { diasSuave: dias.toString(), semanasRestablecer: sem.toString(), resumen };
}
