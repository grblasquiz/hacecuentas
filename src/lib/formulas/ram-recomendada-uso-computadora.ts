export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ramRecomendadaUsoComputadora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const uso=String(i.uso||'basico');
  const t:Record<string,[string,string,string]>={basico:['4 GB','8 GB','16 GB'],gaming:['8 GB','16 GB','32 GB'],dev:['16 GB','32 GB','64 GB'],creativo:['16 GB','32 GB','128 GB'],servidor:['8 GB','32 GB','256 GB']};
  const [m,r,id]=t[uso]||t.basico;
  const resumen = __lang === 'en' ? `Use ${uso}: recommended ${r} RAM.` : `Uso ${uso}: recomendado ${r} RAM.`;
  return { minimo:m, recomendado:r, ideal:id, resumen };
}
