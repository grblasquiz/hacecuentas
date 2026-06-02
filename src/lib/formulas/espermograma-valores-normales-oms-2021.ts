export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function espermogramaValoresNormalesOms2021(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      normal: 'Normal',
      continuar: 'Continuar',
      repetir: 'Repetir en 2-3 meses. Consultar urólogo.',
      todosRango: 'Todos en rango',
      insTitleOk: 'Parámetros dentro de referencia OMS 2021',
      insTitleAlt: 'Hallazgos fuera de referencia',
      insOk: 'Las 4 variables están dentro de los valores de referencia OMS 2021. Un espermograma normal no garantiza fertilidad, pero descarta las alteraciones más frecuentes.',
      insAltA: 'Se detectó',
      insAltB: 'parámetro fuera de rango',
      insAltB2: 'parámetros fuera de rango',
      insAltC: 'Un único análisis no es diagnóstico: se recomienda repetir en 2-3 meses y consultar al urólogo.',
    },
    en: {
      normal: 'Normal',
      continuar: 'Continue',
      repetir: 'Repeat in 2–3 months. Consult a urologist.',
      todosRango: 'All within range',
      insTitleOk: 'Parameters within WHO 2021 reference',
      insTitleAlt: 'Findings outside reference',
      insOk: 'All 4 variables fall within the WHO 2021 reference values. A normal semen analysis does not guarantee fertility, but rules out the most common abnormalities.',
      insAltA: 'Detected',
      insAltB: 'parameter outside range',
      insAltB2: 'parameters outside range',
      insAltC: 'A single test is not diagnostic: repeating in 2–3 months and consulting a urologist is recommended.',
    },
  } as const)[__lang];
  const c=Number(i.concentracion)||0; const m=Number(i.motilidad)||0; const mo=Number(i.morfologia)||0; const v=Number(i.volumen)||0;
  const probs=[];
  if(c<16) probs.push('Oligozoospermia');
  if(m<30) probs.push('Astenozoospermia');
  if(mo<4) probs.push('Teratozoospermia');
  if(v<1.4) probs.push('Hipospermia');
  const diag=probs.length===0?T.normal:probs.join(' + ');
  const rec=probs.length===0?T.continuar:T.repetir;
  const _insight = probs.length===0
    ? { title:T.insTitleOk, text:T.insOk, tone:'good', icon:'🧬' }
    : { title:T.insTitleAlt, text:`${T.insAltA} **${probs.length}** ${probs.length===1?T.insAltB:T.insAltB2} (**${probs.join(', ')}**). ${T.insAltC}`, tone:'warn', icon:'🩺' };
  return { diagnostico:diag, parametros:probs.length>0?probs.join(', '):T.todosRango, recomendacion:rec, _insight };
}
