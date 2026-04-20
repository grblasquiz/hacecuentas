export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function testosteronaNivelesNormalesEdadHombre(i: Inputs): Outputs {
  const t=Number(i.testosterona)||0; const e=Number(i.edad)||0;
  let rMin=350, rMax=900;
  if(e<30){rMin=600;rMax=900} else if(e<40){rMin=500;rMax=800} else if(e<50){rMin=450;rMax=750} else if(e<60){rMin=400;rMax=700} else {rMin=300;rMax=600}
  let clas='', rec='';
  if(t<rMin*0.7){clas='Muy baja';rec='Consulta con endocrinólogo'}
  else if(t<rMin){clas='Baja';rec='Evaluar síntomas, repetir medición AM'}
  else if(t<=rMax){clas='Normal';rec='Mantener hábitos saludables'}
  else {clas='Alta';rec='Investigar causa con médico'}
  return { rangoNormal:`${rMin}-${rMax} ng/dL`, clasificacion:clas, recomendacion:rec };
}
