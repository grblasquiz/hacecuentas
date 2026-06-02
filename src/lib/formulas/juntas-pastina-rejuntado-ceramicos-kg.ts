export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function juntasPastinaRejuntadoCeramicosKg(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = __lang === 'en'
    ? { title: 'Grout estimate', text: `You need about **${r.toFixed(2)} kg** of grout for the job. Buy a bit extra (5–10%) to cover joint variations and waste.`, tone: 'neutral', icon: '🧱' }
    : { title: 'Estimación de pastina', text: `Vas a necesitar aproximadamente **${r.toFixed(2)} kg** de pastina para el trabajo. Comprá un poco de más (5–10%) para cubrir variaciones de junta y desperdicio.`, tone: 'neutral', icon: '🧱' };
  return { resultado:r.toFixed(2), resumen, _insight };
}
