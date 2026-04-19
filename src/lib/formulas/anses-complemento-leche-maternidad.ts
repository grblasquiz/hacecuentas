export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ansesComplementoLecheMaternidad(i: Inputs): Outputs {
  const s=String(i.situacion||'emb');
  const m: Record<string,number> = { emb:15000, lact:15000, h5:12000 };
  return { monto:'$'+(m[s]||0).toLocaleString('es-AR'), resumen:`Complemento leche ${s}: $${(m[s]||0).toLocaleString('es-AR')}/mes.` };
}
