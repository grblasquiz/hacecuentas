export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function potenciarTrabajoProgramaVigente(i: Inputs): Outputs {
  const c=String(i.consulta||'monto');
  const info: Record<string,string> = {
    monto:'~$80.000/mes (50% SMVM aprox)',
    req:'18-65 años, situación vulnerabilidad, sin trabajo registrado',
    cumplimiento:'4 hs diarias capacitación o trabajo comunitario'
  };
  const titulos: Record<string,string> = {
    monto:'Monto del beneficio',
    req:'Requisitos de acceso',
    cumplimiento:'Contraprestación exigida'
  };
  const insight = {
    title: titulos[c] || 'Potenciar Trabajo',
    text: `Sobre **${c}**: ${info[c]||'—'}. El programa está en reconversión desde 2024 (se reemplazó por Volver al Trabajo y Acompañamiento Social); verificá montos y vigencia en ANSES/Desarrollo Social antes de gestionar.`,
    tone: 'warn',
    icon: '🏛️',
  };
  return { info:info[c]||'', resumen:`Potenciar Trabajo ${c}: ${info[c]||'—'}.`, _insight: insight };
}
