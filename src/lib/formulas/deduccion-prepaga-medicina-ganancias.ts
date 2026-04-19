export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function deduccionPrepagaMedicinaGanancias(i: Inputs): Outputs {
  const c=Number(i.cuotaPrepagaMensual)||0; const g=Number(i.gananciaNetaAnual)||0;
  const anual=c*12;
  const tope=g*0.05;
  const deduc=Math.min(anual,tope);
  return { deduccionReal:'$'+deduc.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), topeAnual:'$'+tope.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Prepaga $${c}/mes = $${anual} anual. Deducción efectiva $${deduc.toFixed(0)} (tope 5%).` };
}
