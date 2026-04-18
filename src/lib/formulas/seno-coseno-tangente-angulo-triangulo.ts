export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function senoCosenoTangenteAnguloTriangulo(i: Inputs): Outputs {
  const a=Number(i.ang)||0; const u=String(i.unidad||'deg');
  const rad=u==='deg'?a*Math.PI/180:a;
  const s=Math.sin(rad), c=Math.cos(rad); const t=Math.abs(c)<1e-10?'∞':Math.tan(rad);
  return { seno:s.toFixed(4), coseno:c.toFixed(4), tangente:typeof t==='number'?t.toFixed(4):t, resumen:`${a} ${u}: sin=${s.toFixed(3)}, cos=${c.toFixed(3)}.` };
}
