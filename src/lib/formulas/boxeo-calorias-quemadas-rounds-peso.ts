export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function boxeoCaloriasQuemadasRoundsPeso(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const t=String(i.tipo||'bolsa'); const m=Number(i.minutos)||0;
  const met={'sombra':6,'bolsa':9,'sparring':12,'kickboxing':10}[t];
  const cal=met*p*m/60;
  return { caloriasQuemadas:`${Math.round(cal)} kcal`, mets:`MET ${met}`, interpretacion:`${m} min de ${t}: ${Math.round(cal)} kcal.` };
}
