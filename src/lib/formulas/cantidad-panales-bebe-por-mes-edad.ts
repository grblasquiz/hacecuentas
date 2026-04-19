export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cantidadPanalesBebePorMesEdad(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let d=8; let t='3 (G)';
  if (m<1) { d=12; t='RN'; } else if (m<3) { d=10; t='1 (P)'; } else if (m<6) { d=9; t='2 (M)'; }
  else if (m<12) { d=7; t='3 (G)'; } else if (m<24) { d=6; t='4 (XG)'; } else { d=5; t='5 (XXG)'; }
  return { porDia:d+'/día', porMes:(d*30)+'/mes', talle:t, resumen:`${m} meses: ${d}/día = ${d*30}/mes, talle ${t}.` };
}
