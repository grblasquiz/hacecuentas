export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function volumenSemanalHipertrofiaMusculoSeries(i: Inputs): Outputs {
  const n=String(i.nivel||'intermedio'); const g=String(i.grupoMuscular||'pectoral');
  const base={'principiante':[8,10,14],'intermedio':[12,16,20],'avanzado':[16,20,24]}[n];
  const mod={'pierna':+2,'espalda':+1}[g]||0;
  return { seriesMinimas:`${base[0]+mod} series/semana`, seriesOptimas:`${base[1]+mod} series/semana`, seriesMaximas:`${base[2]+mod} (máximo antes sobreentrenamiento)` };
}
