export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoEmpleadaDomesticaHorasRetiro(i: Inputs): Outputs {
  const cat=String(i.categoria||'tareas-gen');
  const h=Number(i.horas)||0; const r=String(i.conRetiro||'si')==='si';
  const base: Record<string,number> = { supervisor:3500, 'tareas-gen':2800, 'cuidado-per':3000, cocinera:3100, caseros:3300 };
  const b=(base[cat]||2800)*(r?1:1.15);
  const mensual=b*h*4.33;
  const aportes=mensual*0.17;
  return { porHora:'$'+b.toFixed(0), mensual:'$'+mensual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), aportes:'$'+aportes.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${cat}: ${h}h/sem a $${b.toFixed(0)}/h = $${mensual.toFixed(0)}/mes (${r?'con':'sin'} retiro).` };
}
