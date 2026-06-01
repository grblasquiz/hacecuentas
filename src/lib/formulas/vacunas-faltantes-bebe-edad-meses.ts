export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vacunasFaltantesBebeEdadMeses(i: Inputs): Outputs {
  const m=Number(i.mes)||0;
  const cal:Record<number,string>={0:'BCG, Hep B',2:'Pentavalente, OPV, Rotavirus, Neumo, Meningo',4:'Pentavalente, OPV, Rotavirus, Neumo',6:'Pentavalente, OPV, Neumo, Antigripal',12:'Triple Viral, Hep A, Neumo, Meningo refuerzo',15:'Varicela',18:'DTP, OPV refuerzo'};
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let esperadas:string[]=[];
  for (const k of keys) if (k<=m) esperadas.push(`${k}m: ${cal[k]}`);
  const prox=keys.find(k=>k>m);
  const esperadasDetalle=esperadas.join('; ')||'Ninguna todavía';
  // Titular corto: conteo de controles con vacunas (el detalle completo queda en "esperadasDetalle")
  const n=esperadas.length;
  const titular = n===0 ? 'Sin vacunas esperadas aún' : n===1 ? '1 control con vacunas' : `${n} controles con vacunas`;
  return { esperadas:titular, esperadasDetalle, proximas:prox!==undefined?`A los ${prox}m: ${cal[prox]}`:'Calendario completo (edad escolar siguiente)', resumen:`A los ${m}m: ${n} grupos de vacunas esperados.` };
}
