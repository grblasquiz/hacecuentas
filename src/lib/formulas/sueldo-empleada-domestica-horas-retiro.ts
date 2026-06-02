export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoEmpleadaDomesticaHorasRetiro(i: Inputs): Outputs {
  const cat=String(i.categoria||'tareas-gen');
  const h=Number(i.horas)||0; const r=String(i.conRetiro||'si')==='si';
  const base: Record<string,number> = { supervisor:3500, 'tareas-gen':2800, 'cuidado-per':3000, cocinera:3100, caseros:3300 };
  const b=(base[cat]||2800)*(r?1:1.15);
  const mensual=b*h*4.33;
  const aportes=mensual*0.17;
  const costoTotal=mensual+aportes;
  const fmt=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo de bolsillo', value: Math.round(mensual) },
      { label: 'Aportes y cargas (17%)', value: Math.round(aportes) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(costoTotal),
    centerLabel: 'Costo total/mes',
    ariaLabel: 'Costo mensual de la empleada doméstica: sueldo de bolsillo más aportes y cargas sociales.',
  };
  const insight = {
    title: 'Lo que realmente te cuesta por mes',
    text: `Pagás **$${fmt(mensual)}** de sueldo, pero con los aportes (17%) el costo real es **$${fmt(costoTotal)}/mes**. Tené en cuenta esos **$${fmt(aportes)}** extra antes de cerrar las horas${r?'':' (el plus por sin retiro ya está incluido)'}.`,
    tone: 'warn',
    icon: '🧹',
  };
  return { porHora:'$'+b.toFixed(0), mensual:'$'+fmt(mensual), aportes:'$'+fmt(aportes), resumen:`${cat}: ${h}h/sem a $${b.toFixed(0)}/h = $${mensual.toFixed(0)}/mes (${r?'con':'sin'} retiro).`, _chart:chart, _insight:insight };
}
