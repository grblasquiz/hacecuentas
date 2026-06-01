export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function testosteronaNivelesNormalesEdadHombre(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      muyBaja: 'Muy baja',
      muyBajaRec: 'Consulta con endocrinólogo',
      baja: 'Baja',
      bajaRec: 'Evaluar síntomas, repetir medición AM',
      normal: 'Normal',
      normalRec: 'Mantener hábitos saludables',
      alta: 'Alta',
      altaRec: 'Investigar causa con médico',
    },
    en: {
      muyBaja: 'Very low',
      muyBajaRec: 'Consult with an endocrinologist',
      baja: 'Low',
      bajaRec: 'Evaluate symptoms, repeat AM measurement',
      normal: 'Normal',
      normalRec: 'Maintain healthy habits',
      alta: 'High',
      altaRec: 'Investigate cause with a physician',
    },
  } as const)[__lang];
  const t=Number(i.testosterona)||0; const e=Number(i.edad)||0;
  let rMin=350, rMax=900;
  if(e<30){rMin=600;rMax=900} else if(e<40){rMin=500;rMax=800} else if(e<50){rMin=450;rMax=750} else if(e<60){rMin=400;rMax=700} else {rMin=300;rMax=600}
  let clas='', rec='';
  if(t<rMin*0.7){clas=T.muyBaja;rec=T.muyBajaRec}
  else if(t<rMin){clas=T.baja;rec=T.bajaRec}
  else if(t<=rMax){clas=T.normal;rec=T.normalRec}
  else {clas=T.alta;rec=T.altaRec}
  return { rangoNormal:`${rMin}-${rMax} ng/dL`, clasificacion:clas, recomendacion:rec };
}
