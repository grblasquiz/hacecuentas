export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasSuenoBebePorEdadTablaRecomendada(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let h='',s='',n='';
  if(m<3){h='16-17 h';s='5+ siestas';n='4-5 h seguidas a veces'}
  else if(m<6){h='14-15 h';s='3-4 siestas';n='6-8 h noche ideal'}
  else if(m<12){h='14-15 h';s='2-3 siestas';n='10-12 h noche'}
  else if(m<24){h='12-14 h';s='1-2 siestas';n='10-12 h'}
  else {h='10-12 h';s='Siesta opcional';n='10-11 h'}
  return { horasDia:h, siestas:s, sueno:n };
}
