export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function variantesIdiomaEspanolPortuguesInglesRegiones(i: Inputs): Outputs {
  const id=String(i.idioma||'espanol');
  const v:Record<string,[string,string]>={espanol:['Peninsular, Rioplatense, Mexicano, Andino','Vosotros vs Ustedes'],portugues:['Brasileño vs Europeo','Pronunciación y léxico'],ingles:['US, UK, AUS, India','Pronunciación y slang'],frances:['Metropolitano, Québécois','Vocabulario y pronunciación'],arabe:['MSA + dialectos (egipcio, levantino...)','Dialectos pueden ser ininteligibles'],chino:['Mandarín, Cantonés, Hokkien','Tonos y caracteres']};
  const [va,dif]=v[id]||v.espanol;
  return { variantes:va, mayorDif:dif, resumen:`${id}: ${va}. ${dif}.` };
}
