export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function expensasDepartamentoCalcularM2Categoria(i: Inputs): Outputs {
  const m2=Number(i.m2)||0; const c=String(i.categoria||'medio'); const a=Number(i.amenities)||0;
  const perM2: Record<string,number> = { basico:1500, medio:2200, alto:3500 };
  const v=(perM2[c]||2200)+a*400;
  const exp=m2*v;
  return { expensas:'$'+exp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), porM2:'$'+v.toLocaleString('es-AR'), resumen:`${m2}m² ${c}: ~$${v}/m² = $${exp.toFixed(0)}/mes.` };
}
