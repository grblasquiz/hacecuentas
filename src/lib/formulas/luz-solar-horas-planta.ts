export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function luzSolarHorasPlanta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tipos: Record<string, string> = { full: '6-8 h', partial: '3-5 h', shade: '1-3 h' };
  const t = String(i.tipo);
  const resumen = __lang === 'en'
    ? `Plant ${t}: needs ${tipos[t]} of direct sunlight/day.`
    : `Planta ${t}: necesita ${tipos[t]} de sol directo/día.`;
  return { horas: tipos[t] || '?', resumen };
}
