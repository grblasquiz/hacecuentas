export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function adolescenteEstaturaFinalPrediccionEdadHuesos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      observacion: 'Aproximación. Nutrición, genética y pubertad afectan.',
      insTitle: 'Estatura final estimada',
      insIcon: '📏',
      ins: (cm: number, lo: number, hi: number) => `La predicción es de unos **${cm} cm**, con un rango probable de **${lo}-${hi} cm**. Cruza la genética familiar con el crecimiento por edad; tomalo como referencia, no como certeza.`,
    },
    en: {
      observacion: 'Estimate only. Nutrition, genetics and puberty all play a role.',
      insTitle: 'Estimated adult height',
      insIcon: '📏',
      ins: (cm: number, lo: number, hi: number) => `The prediction is about **${cm} cm**, with a likely range of **${lo}-${hi} cm**. It blends family genetics with age-based growth; treat it as a reference, not a certainty.`,
    },
  } as const)[__lang];
  const e=Number(i.edad)||0; const s=String(i.sexo||'varon'); const a=Number(i.alturaActualCm)||0;
  const p=Number(i.alturaPadre)||0; const m=Number(i.alturaMadre)||0;
  let estGenetica=0;
  if(s==='varon') estGenetica=(p+m+13)/2;
  else estGenetica=(p+m-13)/2;
  let estAproxEdad=0;
  if(s==='varon'){ estAproxEdad=e<13?a+((18-e)*4):a+((18-e)*2) }
  else { estAproxEdad=e<11?a+((16-e)*3):a+((16-e)*1.5) }
  const prom=(estGenetica+estAproxEdad)/2;
  const cm=Math.round(prom); const lo=Math.round(prom-5); const hi=Math.round(prom+5);
  const _insight={ title:T.insTitle, text:T.ins(cm,lo,hi), tone:'neutral', icon:T.insIcon };
  return { estaturaFinal:`${cm} cm`, rango:`${lo}-${hi} cm (±5 cm)`, observacion:T.observacion, _insight } as Outputs;
}
