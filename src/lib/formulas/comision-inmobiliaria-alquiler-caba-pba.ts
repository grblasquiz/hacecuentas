export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function comisionInmobiliariaAlquilerCabaPba(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24; const j=String(i.jurisdiccion||'caba');
  const pct=j==='caba'?0.0415:0.05;
  const total=a*p*pct*1.21;
  const propPct=j==='caba'?1:0.5;
  return { total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), inquilino:'$'+(total*(1-propPct)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), propietario:'$'+(total*propPct).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${j.toUpperCase()}: comisión total $${total.toFixed(0)} ${j==='caba'?'(propietario paga 100%)':'(50/50)'}.` };
}
