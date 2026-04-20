export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fertilidadIntentosIvfFivEdadCostoArgentina(i: Inputs): Outputs {
  const t=String(i.tipoTratamiento||'fiv_tradicional'); const c=String(i.clinica||'privada_media');
  const base={'fiv_tradicional':6000,'icsi':8500,'ovulos_donacion':18000,'embrion_donado':14000}[t];
  const mult={'obra_social':0,'privada_media':1,'privada_premium':1.5}[c];
  const total=base*mult;
  const prob={'fiv_tradicional':'35-40% <35a','icsi':'35-40% <35a','ovulos_donacion':'50-60% cualquier edad','embrion_donado':'40-50%'}[t];
  return { costoTotal:c==='obra_social'?'Cubierto por Ley 26.862':`USD ${total.toLocaleString('en-US')}`, probabilidad:prob, observacion:'Ley 26.862 cubre 3-4 intentos. Medicación adicional USD 2-5k.' };
}
