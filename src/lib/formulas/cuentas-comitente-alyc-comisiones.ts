export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; _insight?: any; }
export function cuentasComitenteAlycComisiones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const total = r * p;
  const interes = Math.max(0, total - m);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const fmt = (n: number) => Math.round(n).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  const _insight = __lang === 'en'
    ? {
        title: 'Your monthly payment',
        text: `On $${fmt(m)} over **${p} months** you'd pay about **$${fmt(r)}/month**, repaying **$${fmt(total)}** in total${interes > 0 ? ` — roughly **$${fmt(interes)}** in interest` : ''}.`,
        tone: interes > m * 0.5 ? 'warn' : 'neutral',
        icon: '📊',
      }
    : {
        title: 'Tu cuota mensual',
        text: `Sobre $${fmt(m)} a **${p} meses** pagarías unos **$${fmt(r)}/mes**, devolviendo **$${fmt(total)}** en total${interes > 0 ? ` — cerca de **$${fmt(interes)}** de interés` : ''}.`,
        tone: interes > m * 0.5 ? 'warn' : 'neutral',
        icon: '📊',
      };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
