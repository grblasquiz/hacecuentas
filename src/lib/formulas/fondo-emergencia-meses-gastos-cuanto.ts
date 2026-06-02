export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function fondoEmergenciaMesesGastosCuanto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const aporteFmt = __lang === 'en'
    ? r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')
    : r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const resultado = '$'+aporteFmt;
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const totalAportado = r * p;
  const interes = Math.max(0, totalAportado - m);
  const _insight = __lang === 'en'
    ? {
        title: 'Your monthly target',
        text: `Set aside **$${aporteFmt}/mo** for **${p} months** to reach $${m.toLocaleString('en-US')}.${t > 0 ? ` Interest earns you about $${Math.round(interes).toLocaleString('en-US')}, so you put in less out of pocket.` : ''}`,
        tone: 'neutral',
        icon: '🐷',
      }
    : {
        title: 'Tu cuota mensual',
        text: `Apartá **$${aporteFmt}/mes** durante **${p} meses** para llegar a $${m.toLocaleString('es-AR')}.${t > 0 ? ` El interés aporta unos $${Math.round(interes).toLocaleString('es-AR')}, así que ponés menos de tu bolsillo.` : ''}`,
        tone: 'neutral',
        icon: '🐷',
      };
  return { resultado, resumen, _insight };
}
