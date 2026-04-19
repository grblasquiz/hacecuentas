export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function deficitCaloricoPerderPesoSemana(i: Inputs): Outputs {
  const k=Number(i.kgAPerder)||0; const s=Number(i.semanasObjetivo)||1; const t=Number(i.tdee)||2000;
  const totalDef=k*7700;
  const defDia=totalDef/(s*7);
  const cal=t-defDia;
  const seguro=defDia<=1000?'Saludable':'Excesivo: bajá objetivo o extendé plazo';
  return { deficitDiario:'-'+defDia.toFixed(0)+' kcal', caloriasDieta:cal.toFixed(0)+' kcal/día', seguro, resumen:`${k}kg en ${s}sem: déficit ${defDia.toFixed(0)} kcal/día, dieta ${cal.toFixed(0)} kcal. ${seguro}.` };
}
