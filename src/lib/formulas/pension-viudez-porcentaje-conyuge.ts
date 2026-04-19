export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pensionViudezPorcentajeConyuge(i: Inputs): Outputs {
  const h=Number(i.haberJubilado)||0; const hij=Number(i.hijosMenores)||0;
  const pct=Math.min(1, 0.70+hij*0.10);
  const p=h*pct;
  return { pension:'$'+p.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), porcentaje:(pct*100).toFixed(0)+'%', resumen:`Haber $${h.toLocaleString('es-AR')} × ${(pct*100).toFixed(0)}% = $${p.toFixed(0)}/mes.` };
}
