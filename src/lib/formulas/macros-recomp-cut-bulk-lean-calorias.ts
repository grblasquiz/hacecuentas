export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function macrosRecompCutBulkLeanCalorias(i: Inputs): Outputs {
  const o=String(i.objetivo||'recomp'); const tmb=Number(i.tmb)||2000;
  const mult={'cut':0.80,'recomp':1.0,'lean_bulk':1.12,'bulk':1.22}[o];
  const cal=tmb*mult;
  const prot=Math.round(cal*0.3/4);
  const gra=Math.round(cal*0.25/9);
  const car=Math.round((cal-prot*4-gra*9)/4);
  return { calorias:`${Math.round(cal)} kcal`, proteina:`${prot} g`, carbos:`${car} g`, grasa:`${gra} g` };
}
