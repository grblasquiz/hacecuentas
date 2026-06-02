export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function descansoPostMaratonRegla1DiaKm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km = Number(i.kmCarrera) || 0;
  const dias = Math.round(km / 2);
  const sem = Math.ceil(dias / 7);
  const resumen = __lang === 'en'
    ? `Recovery: ${dias} easy days (~${sem} weeks) after ${km}km.`
    : `Descanso: ${dias} días suaves (~${sem} semanas) post ${km}km.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Reverse-running rule',
        text: `After **${km} km** the rule suggests about **${dias} easy days** (~**${sem} ${sem === 1 ? 'week' : 'weeks'}**) before pushing hard again. Easy means gentle jogging, cross-training or rest — not zero movement, but no intensity or racing.`,
        tone: 'warn',
        icon: '🏃',
      }
    : {
        title: 'La regla del reverse running',
        text: `Después de **${km} km** la regla sugiere unos **${dias} días suaves** (~**${sem} ${sem === 1 ? 'semana' : 'semanas'}**) antes de volver a exigir fuerte. Suave es trote liviano, cross-training o descanso: no es parar del todo, pero sí sin intensidad ni competencias.`,
        tone: 'warn',
        icon: '🏃',
      };
  return { diasSuave: dias.toString(), semanasRestablecer: sem.toString(), resumen, _insight };
}
