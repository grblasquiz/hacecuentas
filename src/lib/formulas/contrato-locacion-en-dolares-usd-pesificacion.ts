export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function contratoLocacionEnDolaresUsdPesificacion(i: Inputs): Outputs {
  const u=Number(i.alquilerUsd)||0; const c=String(i.dolar||'mep');
  const cotiz: Record<string,number> = { of:1400, mep:1450, blue:1500 };
  const v=u*(cotiz[c]||1450);
  return { enPesos:'$'+v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), pros:'Protección vs inflación AR', contras:'Sueldo ARS: riesgo devaluación', resumen:`USD ${u} @ ${c}: $${v.toFixed(0)}.` };
}
