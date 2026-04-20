export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function panalesMensualBebeTallaCambiosDia(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let d,t;
  if(m<1){d=11;t='NB o Talla 0'}
  else if(m<3){d=9;t='Talla 1-2'}
  else if(m<6){d=7;t='Talla 3'}
  else if(m<12){d=6;t='Talla 4'}
  else if(m<24){d=5;t='Talla 5'}
  else {d=4;t='Talla 6 o pants'}
  return { porDia:`${d} pañales`, porMes:`~${d*30} pañales`, talla:t };
}
