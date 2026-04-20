export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zincDosisInmunidadHombreMujerEdad(i: Inputs): Outputs {
  const sx=String(i.sexo||'hombre'); const o=String(i.objetivo||'mantenimiento');
  let d=sx==='hombre'?11:8;
  if(o==='inmunidad') d=15;
  else if(o==='resfrio') d=50;
  else if(o==='embarazo') d=12;
  return { dosis:`${d} mg/día`, forma:'Picolinato o gluconato', advertencia:o==='resfrio'?'Solo uso corto (5-7 días). Tomar con comida.':'No exceder 40 mg/día largo plazo.' };
}
