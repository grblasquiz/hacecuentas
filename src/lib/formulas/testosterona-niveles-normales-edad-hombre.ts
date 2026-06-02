export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
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
      insightTitle: 'Tu testosterona según la edad',
      insightNormal: (t: number, e: number, lo: number, hi: number) => `Con **${t} ng/dL** a los ${e} años, estás dentro del rango esperado (**${lo}–${hi} ng/dL**). Mantené sueño, ejercicio de fuerza y peso saludable.`,
      insightBaja: (t: number, e: number, lo: number, hi: number) => `**${t} ng/dL** queda por debajo del rango esperado para tu edad (**${lo}–${hi} ng/dL**). Conviene repetir el análisis a la mañana y evaluar síntomas con tu médico.`,
      insightAlta: (t: number, e: number, lo: number, hi: number) => `**${t} ng/dL** está por encima del rango esperado (**${lo}–${hi} ng/dL**). Vale la pena investigar la causa (suplementos, anabólicos, otras) con un especialista.`,
      gMuyBaja: 'Muy baja',
      gBaja: 'Baja',
      gNormal: 'Normal',
      gAlta: 'Alta',
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
      insightTitle: 'Your testosterone for your age',
      insightNormal: (t: number, e: number, lo: number, hi: number) => `At **${t} ng/dL** and age ${e}, you're within the expected range (**${lo}–${hi} ng/dL**). Keep up sleep, strength training and a healthy weight.`,
      insightBaja: (t: number, e: number, lo: number, hi: number) => `**${t} ng/dL** is below the expected range for your age (**${lo}–${hi} ng/dL**). It's worth repeating the test in the morning and evaluating symptoms with your doctor.`,
      insightAlta: (t: number, e: number, lo: number, hi: number) => `**${t} ng/dL** is above the expected range (**${lo}–${hi} ng/dL**). It's worth investigating the cause (supplements, anabolics, other) with a specialist.`,
      gMuyBaja: 'Very low',
      gBaja: 'Low',
      gNormal: 'Normal',
      gAlta: 'High',
    },
  } as const)[__lang];
  const t=Number(i.testosterona)||0; const e=Number(i.edad)||0;
  let rMin=350, rMax=900;
  if(e<30){rMin=600;rMax=900} else if(e<40){rMin=500;rMax=800} else if(e<50){rMin=450;rMax=750} else if(e<60){rMin=400;rMax=700} else {rMin=300;rMax=600}
  let clas='', rec='';
  let zona: 'baja' | 'normal' | 'alta' = 'normal';
  if(t<rMin*0.7){clas=T.muyBaja;rec=T.muyBajaRec;zona='baja'}
  else if(t<rMin){clas=T.baja;rec=T.bajaRec;zona='baja'}
  else if(t<=rMax){clas=T.normal;rec=T.normalRec;zona='normal'}
  else {clas=T.alta;rec=T.altaRec;zona='alta'}

  const insightFn = zona === 'normal' ? T.insightNormal : zona === 'baja' ? T.insightBaja : T.insightAlta;
  const _insight = {
    title: T.insightTitle,
    text: insightFn(t, e, rMin, rMax),
    tone: zona === 'normal' ? 'good' : 'warn',
    icon: zona === 'alta' ? '⚠️' : '🧪',
  };

  const _chart = {
    type: 'scale' as const,
    marker: t,
    markerLabel: `${t} ng/dL`,
    min: 0,
    unit: 'ng/dL',
    segments: [
      { nombre: T.gMuyBaja, max: Math.round(rMin * 0.7), color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.gBaja, max: rMin, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.gNormal, max: rMax, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.gAlta, max: Math.max(rMax + 200, Math.ceil(t) + 50), color: '#bfdbfe', colorDark: '#1e40af' },
    ],
    ariaLabel: `Escala de testosterona para tu edad: tu valor ${t} ng/dL cae en la zona ${clas} (rango normal ${rMin}–${rMax} ng/dL).`,
  };

  return { rangoNormal:`${rMin}-${rMax} ng/dL`, clasificacion:clas, recomendacion:rec, _insight, _chart };
}
