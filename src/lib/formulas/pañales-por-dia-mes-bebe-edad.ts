export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function pañalesPorDiaMesBebeEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.mes)||0;
  let d:number; let t:string;
  if (m<=2) { d=11; t='RN/T1'; }
  else if (m<=6) { d=8; t='T2/T3'; }
  else if (m<=12) { d=6; t='T3/T4'; }
  else if (m<=24) { d=5; t='T4/T5'; }
  else { d=4; t='T5/T6'; }
  const diarios = __lang === 'en' ? `${d}/day` : `${d}/día`;
  const mensuales = __lang === 'en' ? `~${d*30}/month` : `~${d*30}/mes`;
  const resumen = __lang === 'en'
    ? `At ${m} months: ${d} diapers/day (~${d*30}/month), size ${t}.`
    : `A los ${m} meses: ${d} pañales/día (~${d*30}/mes), talle ${t}.`;
  return { diarios, mensuales, tamano:t, resumen };
}
