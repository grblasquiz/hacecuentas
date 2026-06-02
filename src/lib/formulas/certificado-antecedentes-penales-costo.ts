export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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
  const costoFmt = '$' + c.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  const esExp = u === 'exp';
  const _insight = {
    title: __lang === 'en' ? 'Cost and turnaround' : 'Costo y demora',
    text: __lang === 'en'
      ? `The **${uLabel}** certificate costs **${costoFmt}** and is ready in **${t1en}**. It stays valid for **30 days**, so request it close to when you actually need it.${esExp ? ' Express runs about 4× the standard fee — only worth it if you truly can\'t wait.' : ''}`
      : `El certificado **${u}** cuesta **${costoFmt}** y sale en **${t1es}**. Tiene una validez de **30 días**, así que pedilo cerca de cuando lo necesites.${esExp ? ' El exprés cuesta unas 4× el común: conviene solo si de verdad no podés esperar.' : ''}`,
    tone: esExp ? 'warn' : 'neutral',
    icon: '📄',
  };
  return {
    costo: costoFmt,
    validez: __lang === 'en' ? '30 days' : '30 días',
    resumen: __lang === 'en'
      ? `${uLabel}: $${c.toLocaleString('en-US')} (${t1en}).`
      : `${u}: $${c.toLocaleString('es-AR')} (${t1es}).`,
    _insight,
  };
}
