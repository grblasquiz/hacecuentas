export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vacunasFaltantesBebeEdadMeses(i: Inputs): Outputs {
  const m=Number(i.mes)||0;
  const cal:Record<number,string>={0:'BCG, Hep B',2:'Pentavalente, OPV, Rotavirus, Neumo, Meningo',4:'Pentavalente, OPV, Rotavirus, Neumo',6:'Pentavalente, OPV, Neumo, Antigripal',12:'Triple Viral, Hep A, Neumo, Meningo refuerzo',15:'Varicela',18:'DTP, OPV refuerzo'};
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let esperadas:string[]=[];
  for (const k of keys) if (k<=m) esperadas.push(`${k}m: ${cal[k]}`);
  const prox=keys.find(k=>k>m);
  return { esperadas:esperadas.join('; ')||'Ninguna', proximas:prox!==undefined?`A los ${prox}m: ${cal[prox]}`:'Calendario completo (edad escolar siguiente)', resumen:`A los ${m}m: ${esperadas.length} grupos de vacunas esperados.` };
}
