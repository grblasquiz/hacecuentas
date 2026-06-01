export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ccaBateriaAutoTemperaturaMotor(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const cc=Number(i.cc)||0; const t=String(i.tipo||'nafta');
  const mult=t==='diesel'?2:1;
  const min=Math.round(cc/1000*300*mult); const rec=Math.round(min*1.2);
  const resumen = __lang === 'en'
    ? `${cc}cc ${t}: min CCA ${min}, recommended ${rec}.`
    : `${cc}cc ${t}: CCA mín ${min}, recomendado ${rec}.`;
  return { ccaMin:`${min} CCA`, ccaRecom:`${rec} CCA`, resumen };
}
