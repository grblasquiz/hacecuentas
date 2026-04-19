export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoPanaderoBasicoFeriadoNocturno(i: Inputs): Outputs {
  const cat=String(i.categoria||'oficial'); const ant=Number(i.antiguedad)||0; const hn=Number(i.horasNocturnas)||0;
  const base: Record<string,number> = { ayudante:920000, medio:1050000, oficial:1200000 };
  const b=(base[cat]||1050000)*(1+ant*0.01);
  const nocturno=(b/160)*hn*4.33*0.30;
  const bruto=b+nocturno;
  const neto=bruto*0.83;
  return { basico:'$'+b.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), bruto:'$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${cat} con ${hn}h noche/sem: neto ~$${neto.toFixed(0)}.` };
}
