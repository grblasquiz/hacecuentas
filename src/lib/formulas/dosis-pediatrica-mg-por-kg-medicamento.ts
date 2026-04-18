export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dosisPediatricaMgPorKgMedicamento(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const m=String(i.med||'paracetamol');
  const ds:Record<string,{min:number,max:number,cada:string}>={paracetamol:{min:10,max:15,cada:'6h'},ibuprofeno:{min:5,max:10,cada:'8h'},amoxi:{min:25,max:25,cada:'12h'}};
  const d=ds[m]||ds.paracetamol;
  return { dosis:`${(p*d.min).toFixed(0)}-${(p*d.max).toFixed(0)} mg`, frecuencia:`Cada ${d.cada}`, resumen:`${p}kg ${m}: ${(p*d.min).toFixed(0)}-${(p*d.max).toFixed(0)}mg cada ${d.cada}. Consultar pediatra.` };
}
