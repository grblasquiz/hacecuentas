export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function embarazadaAumentoPesoSemanaImcPrevio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const imc=Number(i.imcPrevio)||22; const s=Number(i.semanasEmbarazo)||0;
  let min=0,max=0;
  // IOM 2009 guidelines (adopted by WHO and Argentina MOH)
  if(imc<18.5){min=12.5;max=18}
  else if(imc<25){min=11.5;max=16}
  else if(imc<30){min=7;max=11.5}
  else {min=5;max=9}
  const prog=s/40;
  const aumSemMin=min*prog*0.9;
  const aumSemMax=max*prog;
  const cat = imc<18.5 ? (__lang==='en'?'underweight':'bajo peso')
    : imc<25 ? (__lang==='en'?'normal weight':'peso normal')
    : imc<30 ? (__lang==='en'?'overweight':'sobrepeso')
    : (__lang==='en'?'obesity':'obesidad');
  const T:any = {
    es: {
      title: 'Tu rango de aumento de peso',
      text: `Con un IMC previo de **${imc.toFixed(1)}** (${cat}), el aumento total recomendado para todo el embarazo es de **${min} a ${max} kg**. ${s>0?`A la semana **${s}** deberías haber sumado entre **${aumSemMin.toFixed(1)} y ${aumSemMax.toFixed(1)} kg**.`:'Cargá la semana actual para ver cuánto te corresponde a esta altura.'}`,
    },
    en: {
      title: 'Your weight-gain range',
      text: `With a pre-pregnancy BMI of **${imc.toFixed(1)}** (${cat}), the recommended total gain for the whole pregnancy is **${min} to ${max} kg**. ${s>0?`By week **${s}** you should have gained between **${aumSemMin.toFixed(1)} and ${aumSemMax.toFixed(1)} kg**.`:'Enter the current week to see how much applies at this stage.'}`,
    },
  };
  return {
    aumentoEsperadoSemana: __lang === 'en'
      ? `${aumSemMin.toFixed(1)}-${aumSemMax.toFixed(1)} kg by week ${s}`
      : `${aumSemMin.toFixed(1)}-${aumSemMax.toFixed(1)} kg hasta semana ${s}`,
    aumentoTotal: __lang === 'en'
      ? `${min}-${max} kg total`
      : `${min}-${max} kg total`,
    observacion: __lang === 'en'
      ? `Pre-pregnancy BMI ${imc.toFixed(1)}: range based on IOM 2009.`
      : `IMC previo ${imc.toFixed(1)}: rango basado en IOM 2009.`,
    _insight: {
      title: T[__lang].title,
      text: T[__lang].text,
      tone: (imc<18.5 || imc>=30) ? 'warn' : 'neutral',
      icon: '🤰',
    },
    _chart: {
      type: 'scale',
      marker: Number(imc.toFixed(1)),
      markerLabel: `IMC ${imc.toFixed(1)}`,
      min: 15,
      segments: [
        { nombre: __lang==='en'?'Underweight':'Bajo peso', max: 18.5, color: '#60a5fa', colorDark: '#93c5fd' },
        { nombre: __lang==='en'?'Normal':'Normal', max: 25, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: __lang==='en'?'Overweight':'Sobrepeso', max: 30, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: __lang==='en'?'Obesity':'Obesidad', max: Math.max(40, Number(imc.toFixed(1)) + 2), color: '#ef4444', colorDark: '#f87171' },
      ],
      ariaLabel: __lang==='en'
        ? `Pre-pregnancy BMI ${imc.toFixed(1)} in the ${cat} range`
        : `IMC previo ${imc.toFixed(1)} en el rango de ${cat}`,
    },
  };
}
