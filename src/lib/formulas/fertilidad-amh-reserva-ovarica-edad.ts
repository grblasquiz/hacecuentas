export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fertilidadAmhReservaOvaricaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      disminuida: 'Disminuida',
      menor: 'Menor',
      recBaja: 'Consulta con especialista en fertilidad',
      normal: 'Normal para la edad',
      adecuada: 'Adecuada',
      recNormal: 'Mantén controles regulares',
      alta: 'Alta (posible SOP)',
      variable: 'Variable',
      recAlta: 'Evaluar por endocrino/ginecólogo',
    },
    en: {
      disminuida: 'Low',
      menor: 'Lower',
      recBaja: 'Consult a fertility specialist',
      normal: 'Normal for age',
      adecuada: 'Adequate',
      recNormal: 'Keep up with regular checkups',
      alta: 'High (possible PCOS)',
      variable: 'Variable',
      recAlta: 'Evaluate with an endocrinologist/gynecologist',
    },
  } as const)[__lang];
  const a=Number(i.amhNgMl)||0; const e=Number(i.edadMujer)||0;
  let rangoBajo=0.8, rangoAlto=3.0;
  if(e<30){rangoBajo=2.0;rangoAlto=5.0} else if(e<35){rangoBajo=1.5;rangoAlto=4.0} else if(e<40){rangoBajo=0.9;rangoAlto=3.0} else {rangoBajo=0.5;rangoAlto=2.0}
  let clas='', fert='', rec='';
  if(a<rangoBajo){clas=T.disminuida;fert=T.menor;rec=T.recBaja}
  else if(a<=rangoAlto){clas=T.normal;fert=T.adecuada;rec=T.recNormal}
  else {clas=T.alta;fert=T.variable;rec=T.recAlta}
  return { clasificacion:clas, fertilidad:fert, recomendacion:rec };
}
