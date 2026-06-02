export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; _chart?: any; }
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
      insTitle: 'Tu reserva ovárica',
      insBaja: (a: string, e: string, lo: string) => `Una AMH de **${a} ng/ml** a los **${e} años** queda por debajo del rango esperado (**${lo}+**): sugiere reserva ovárica disminuida. No mide calidad ni impide embarazo, pero conviene una consulta con especialista sin demoras.`,
      insNormal: (a: string, e: string, lo: string, hi: string) => `Una AMH de **${a} ng/ml** a los **${e} años** está dentro del rango normal para tu edad (**${lo}–${hi}**). Es un buen indicador de cantidad de óvulos; recordá que no mide la calidad.`,
      insAlta: (a: string, e: string, hi: string) => `Una AMH de **${a} ng/ml** a los **${e} años** supera el rango esperado (sobre **${hi}**). Suele asociarse a síndrome de ovario poliquístico (SOP); conviene evaluación endocrinológica.`,
      segBaja: 'Disminuida', segNormal: 'Normal', segAlta: 'Alta',
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
      insTitle: 'Your ovarian reserve',
      insBaja: (a: string, e: string, lo: string) => `An AMH of **${a} ng/mL** at age **${e}** falls below the expected range (**${lo}+**), suggesting a diminished ovarian reserve. It does not measure egg quality or rule out pregnancy, but a specialist visit soon is wise.`,
      insNormal: (a: string, e: string, lo: string, hi: string) => `An AMH of **${a} ng/mL** at age **${e}** is within the normal range for your age (**${lo}–${hi}**). It is a good marker of egg quantity; remember it does not measure quality.`,
      insAlta: (a: string, e: string, hi: string) => `An AMH of **${a} ng/mL** at age **${e}** is above the expected range (over **${hi}**). It is often linked to polycystic ovary syndrome (PCOS); an endocrinology assessment is advisable.`,
      segBaja: 'Low', segNormal: 'Normal', segAlta: 'High',
    },
  } as const)[__lang];
  const a=Number(i.amhNgMl)||0; const e=Number(i.edadMujer)||0;
  let rangoBajo=0.8, rangoAlto=3.0;
  if(e<30){rangoBajo=2.0;rangoAlto=5.0} else if(e<35){rangoBajo=1.5;rangoAlto=4.0} else if(e<40){rangoBajo=0.9;rangoAlto=3.0} else {rangoBajo=0.5;rangoAlto=2.0}
  let clas='', fert='', rec='';
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insText = '';
  const aStr = String(a), eStr = String(e), loStr = String(rangoBajo), hiStr = String(rangoAlto);
  if(a<rangoBajo){clas=T.disminuida;fert=T.menor;rec=T.recBaja; tone='warn'; insText=T.insBaja(aStr,eStr,loStr);}
  else if(a<=rangoAlto){clas=T.normal;fert=T.adecuada;rec=T.recNormal; tone='good'; insText=T.insNormal(aStr,eStr,loStr,hiStr);}
  else {clas=T.alta;fert=T.variable;rec=T.recAlta; tone='warn'; insText=T.insAlta(aStr,eStr,hiStr);}

  // Escala: marker = AMH; zonas por umbrales ajustados a la edad
  const topSeg = Math.max(rangoAlto + 1, Math.ceil(a) + 0.5);
  return {
    clasificacion:clas, fertilidad:fert, recomendacion:rec,
    _insight: { title: T.insTitle, text: insText, tone, icon: '🥚' },
    _chart: {
      type: 'scale',
      marker: a,
      markerLabel: `AMH ${a}`,
      min: 0,
      segments: [
        { nombre: T.segBaja, max: rangoBajo, color: '#f87171', colorDark: '#ef4444' },
        { nombre: T.segNormal, max: rangoAlto, color: '#34d399', colorDark: '#10b981' },
        { nombre: T.segAlta, max: topSeg, color: '#fbbf24', colorDark: '#f59e0b' },
      ],
      ariaLabel: `AMH ${a} ng/ml sobre la escala de reserva ovárica para ${e} años: ${clas}`,
    },
  };
}
