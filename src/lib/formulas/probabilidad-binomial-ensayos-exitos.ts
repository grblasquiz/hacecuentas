export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function probabilidadBinomialEnsayosExitos(i: Inputs): Outputs {
  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0); const p=Number(i.p)||0;
  if (k<0||k>n||p<0||p>1) return { prob:'—', media:'—', var:'—', resumen:'Parámetros fuera de rango.' };
  let c=1; for (let j=0;j<Math.min(k,n-k);j++) c=c*(n-j)/(j+1);
  const prob=c*Math.pow(p,k)*Math.pow(1-p,n-k);
  return { prob:prob.toFixed(5), media:(n*p).toFixed(2), var:(n*p*(1-p)).toFixed(2), resumen:`P(X=${k})=${prob.toFixed(4)}, μ=${(n*p).toFixed(1)}.` };
}
