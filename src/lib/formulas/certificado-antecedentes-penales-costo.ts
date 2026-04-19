export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function certificadoAntecedentesPenalesCosto(i: Inputs): Outputs {
  const u=String(i.urgencia||'comun');
  const t: Record<string,[number,string]> = { comun:[30000,'5 días'], urg:[60000,'24 horas'], exp:[120000,'3 horas'] };
  const [c,t1]=t[u]||t.comun;
  return { costo:'$'+c.toLocaleString('es-AR'), validez:'30 días', resumen:`${u}: $${c.toLocaleString('es-AR')} (${t1}).` };
}
