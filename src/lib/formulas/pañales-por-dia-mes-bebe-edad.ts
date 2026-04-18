export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pañalesPorDiaMesBebeEdad(i: Inputs): Outputs {
  const m=Number(i.mes)||0;
  let d:number; let t:string;
  if (m<=2) { d=11; t='RN/T1'; }
  else if (m<=6) { d=8; t='T2/T3'; }
  else if (m<=12) { d=6; t='T3/T4'; }
  else if (m<=24) { d=5; t='T4/T5'; }
  else { d=4; t='T5/T6'; }
  return { diarios:`${d}/día`, mensuales:`~${d*30}/mes`, tamano:t, resumen:`A los ${m} meses: ${d} pañales/día (~${d*30}/mes), talle ${t}.` };
}
