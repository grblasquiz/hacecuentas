export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fondoComunInversionMoneyMarketRendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const tasaAnual=(Number(i.tasa)||0);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString(__lang==='en'?'en-US':'es-AR');
  const _insight = __lang === 'en'
    ? { title:'Monthly money-market yield', text:`At **${tasaAnual.toFixed(1)}%** annual, **${fmt(m)}** generates about **${fmt(r)}/mo** over ${p} months. Remember: a money-market FCI has no lock-in — you can redeem in 24-48h.`, tone:'neutral', icon:'💵' }
    : { title:'Rendimiento mensual money market', text:`Con una tasa de **${tasaAnual.toFixed(1)}%** anual, **${fmt(m)}** te rinde unos **${fmt(r)}/mes** a lo largo de ${p} meses. Recordá: un FCI money market no inmoviliza tu plata, rescatás en 24-48h.`, tone:'neutral', icon:'💵' };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
