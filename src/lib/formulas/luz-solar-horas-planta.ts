export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function luzSolarHorasPlanta(i: Inputs): Outputs {
  const tipos: Record<string, string> = { full: '6-8 h', partial: '3-5 h', shade: '1-3 h' };
  const t = String(i.tipo);
  return { horas: tipos[t] || '?', resumen: `Planta ${t}: necesita ${tipos[t]} de sol directo/día.` };
}
