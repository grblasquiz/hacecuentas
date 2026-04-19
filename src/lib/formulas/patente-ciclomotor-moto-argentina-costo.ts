export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function patenteCiclomotorMotoArgentinaCosto(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const c=String(i.cilindrada||'moto');
  const pat: Record<string,number> = { cic:0, moto:v*0.03, gran:v*0.045 };
  const p=pat[c]||v*0.03;
  const costo=45000+v*0.008;
  return { costo:'$'+costo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), patente:'$'+p.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Moto ${c} $${v.toLocaleString('es-AR')}: registro $${costo.toFixed(0)}, patente $${p.toFixed(0)}.` };
}
