export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function certificadoAntecedentesPenalesCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const u=String(i.urgencia||'comun');
  const t: Record<string,[number,string,string]> = {
    comun:[30000,'5 días','5 days'],
    urg:[60000,'24 horas','24 hours'],
    exp:[120000,'3 horas','3 hours'],
  };
  const [c,t1es,t1en]=t[u]||t.comun;
  const t1 = __lang === 'en' ? t1en : t1es;
  const uLabel = __lang === 'en'
    ? ({ comun:'Standard', urg:'Urgent', exp:'Express' }[u] ?? u)
    : u;
  return {
    costo:'$'+c.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR'),
    validez: __lang === 'en' ? '30 days' : '30 días',
    resumen: __lang === 'en'
      ? `${uLabel}: $${c.toLocaleString('en-US')} (${t1en}).`
      : `${u}: $${c.toLocaleString('es-AR')} (${t1es}).`,
  };
}
