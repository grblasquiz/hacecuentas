export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function licenciaConducirCostoCategoriaB1A(i: Inputs): Outputs {
  const t=String(i.tipo||'nueva'); const c=String(i.categoria||'b');
  const baseTipo: Record<string,number> = { nueva:40000, renov:25000, duplicado:15000, ampliacion:30000 };
  const multCat: Record<string,number> = { a:1, b:1, c:1.4, d:1.5, e:1.3 };
  const t1=(baseTipo[t]||40000)*(multCat[c]||1);
  return { costo:'$'+t1.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), validez:'5 años primera, luego 2-5 según edad', resumen:`${t} ${c.toUpperCase()}: ~$${t1.toFixed(0)}.` };
}
