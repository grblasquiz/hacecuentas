export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; }
export function fertilidadIntentosIvfFivEdadCostoArgentina(i: Inputs): Outputs {
  const t=String(i.tipoTratamiento||'fiv_tradicional'); const c=String(i.clinica||'privada_media');
  const base=({'fiv_tradicional':6000,'icsi':8500,'ovulos_donacion':18000,'embrion_donado':14000} as Record<string, number>)[t] ?? 6000;
  const mult=({'obra_social':0,'privada_media':1,'privada_premium':1.5} as Record<string, number>)[c] ?? 1;
  const total=base*mult;
  const prob=({'fiv_tradicional':'35-40% <35a','icsi':'35-40% <35a','ovulos_donacion':'50-60% cualquier edad','embrion_donado':'40-50%'} as Record<string, string>)[t] ?? '35-40% <35a';

  const nombreTrat=({'fiv_tradicional':'FIV tradicional','icsi':'ICSI','ovulos_donacion':'óvulos de donante','embrion_donado':'embrión donado'} as Record<string, string>)[t] ?? 'el tratamiento';
  let insTone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insText='';
  if(c==='obra_social'){
    insTone='good';
    insText=`La Ley 26.862 obliga a obras sociales y prepagas a cubrir **3-4 intentos** de ${nombreTrat}: tu costo del procedimiento es **$0**. Presupuestá aparte la **medicación (USD 2.000-5.000)**, que suele tener cobertura parcial.`;
  } else {
    insTone='warn';
    const totalFmt=`USD ${total.toLocaleString('en-US')}`;
    insText=`Por vía privada, un ciclo de ${nombreTrat} ronda los **${totalFmt}**, sin contar la **medicación (USD 2.000-5.000)**. Si tenés obra social o prepaga, la Ley 26.862 te cubre 3-4 intentos — conviene reclamarla antes de pagar de tu bolsillo.`;
  }

  return { costoTotal:c==='obra_social'?'Cubierto por Ley 26.862':`USD ${total.toLocaleString('en-US')}`, probabilidad:prob, observacion:'Ley 26.862 cubre 3-4 intentos. Medicación adicional USD 2-5k.', _insight: { title: 'Costo y cobertura', text: insText, tone: insTone, icon: '🧬' } };
}
