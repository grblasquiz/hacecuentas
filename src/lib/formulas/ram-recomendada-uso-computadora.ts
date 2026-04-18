export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ramRecomendadaUsoComputadora(i: Inputs): Outputs {
  const uso=String(i.uso||'basico');
  const t:Record<string,[string,string,string]>={basico:['4 GB','8 GB','16 GB'],gaming:['8 GB','16 GB','32 GB'],dev:['16 GB','32 GB','64 GB'],creativo:['16 GB','32 GB','128 GB'],servidor:['8 GB','32 GB','256 GB']};
  const [m,r,id]=t[uso]||t.basico;
  return { minimo:m, recomendado:r, ideal:id, resumen:`Uso ${uso}: recomendado ${r} RAM.` };
}
