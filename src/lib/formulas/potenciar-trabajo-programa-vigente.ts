export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function potenciarTrabajoProgramaVigente(i: Inputs): Outputs {
  const c=String(i.consulta||'monto');
  const info: Record<string,string> = {
    monto:'~$80.000/mes (50% SMVM aprox)',
    req:'18-65 años, situación vulnerabilidad, sin trabajo registrado',
    cumplimiento:'4 hs diarias capacitación o trabajo comunitario'
  };
  return { info:info[c]||'', resumen:`Potenciar Trabajo ${c}: ${info[c]||'—'}.` };
}
