export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cedearsRatioConversionAppleMicrosoft(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const total=r*p; const interes=Math.max(0,total-m);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : __lang === 'pt'
    ? `Valor $${m.toLocaleString('pt-BR')} × ${p} meses: $${r.toFixed(0)}/mês.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const fmt=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const fmtEn=(n:number)=>n.toLocaleString('en-US',{maximumFractionDigits:0});
  const _insight = __lang === 'en'
    ? { title: 'What you really pay', text: `A $${fmtEn(r)}/mo installment over ${p} months adds up to **$${fmtEn(total)}**, meaning **$${fmtEn(interes)} in interest** on top of the $${fmtEn(m)} financed.`, tone: interes>m*0.3?'warn':'neutral', icon: '💳' }
    : __lang === 'pt'
    ? { title: 'O que você paga de verdade', text: `Uma parcela de $${fmt(r)}/mês por ${p} meses soma **$${fmt(total)}**, ou seja **$${fmt(interes)} de juros** sobre os $${fmt(m)} financiados.`, tone: interes>m*0.3?'warn':'neutral', icon: '💳' }
    : { title: 'Lo que pagás de verdad', text: `Una cuota de $${fmt(r)}/mes durante ${p} meses suma **$${fmt(total)}**, es decir **$${fmt(interes)} de intereses** sobre los $${fmt(m)} financiados.`, tone: interes>m*0.3?'warn':'neutral', icon: '💳' };
  return { resultado:'$'+fmt(r), resumen, _insight };
}
