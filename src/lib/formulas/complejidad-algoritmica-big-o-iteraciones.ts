export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function complejidadAlgoritmicaBigOIteraciones(i: Inputs): Outputs {
  const n=Number(i.n)||1; const t=String(i.tipo||'n');
  let ops:number;
  if (t==='1') ops=1;
  else if (t==='logn') ops=Math.log2(n);
  else if (t==='n') ops=n;
  else if (t==='nlogn') ops=n*Math.log2(n);
  else if (t==='n2') ops=n*n;
  else ops=Math.pow(2,Math.min(n,100));
  const seg=ops/1e9;
  let txt:string;
  if (seg<1e-6) txt=`${(seg*1e9).toFixed(1)} ns`;
  else if (seg<1e-3) txt=`${(seg*1e6).toFixed(1)} µs`;
  else if (seg<1) txt=`${(seg*1000).toFixed(1)} ms`;
  else txt=`${seg.toFixed(2)} s`;
  return { ops:ops.toExponential(2), tiempo:txt, resumen:`n=${n}, ${t}: ${ops.toExponential(1)} ops ≈ ${txt}.` };
}
