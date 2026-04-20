export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function magnesioDosisDeficienciaSintomas(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer');
  let rda=sx==='hombre'?(e>30?420:400):(e>30?320:310);
  return { rda:`${rda} mg/día`, mejorForma:'Glicinato o citrato (mejor absorción que óxido)', fuentes:'Chocolate 70%+, almendras, semillas calabaza, espinacas, palta, legumbres.' };
}
