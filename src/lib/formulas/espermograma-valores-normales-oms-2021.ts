export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function espermogramaValoresNormalesOms2021(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      normal: 'Normal',
      continuar: 'Continuar',
      repetir: 'Repetir en 2-3 meses. Consultar urólogo.',
      todosRango: 'Todos en rango',
    },
    en: {
      normal: 'Normal',
      continuar: 'Continue',
      repetir: 'Repeat in 2–3 months. Consult a urologist.',
      todosRango: 'All within range',
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
  return { diagnostico:diag, parametros:probs.length>0?probs.join(', '):T.todosRango, recomendacion:rec };
}
