export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function bonusAnualMarcoFiscalNeto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const b=Number(i.bonusBruto)||0; const a=Number(i.alicuotaGanancias)||0;
  const aportes=b*0.17; const netoAportes=b-aportes; const ret=netoAportes*a/100; const neto=netoAportes-ret;
  const interpretacion = __lang === 'en'
    ? `Gross $${b.toLocaleString('es-AR')} - social contributions 17% - Income Tax ${a}% = Net $${Math.round(neto).toLocaleString('es-AR')} (${(neto/b*100).toFixed(0)}% of gross).`
    : `Bruto $${b.toLocaleString('es-AR')} - aportes 17% - Ganancias ${a}% = Neto $${Math.round(neto).toLocaleString('es-AR')} (${(neto/b*100).toFixed(0)}% del bruto).`;
  const netoPct = b>0 ? neto/b*100 : 0;
  const descTotal = Math.round(aportes+ret);
  const _insight = b>0 ? {
    title: __lang==='en' ? 'What lands in your account' : 'Lo que te queda en el bolsillo',
    text: __lang==='en'
      ? `Of the **$${b.toLocaleString('es-AR')}** gross bonus, **$${descTotal.toLocaleString('es-AR')}** goes to contributions + Income Tax, leaving **$${Math.round(neto).toLocaleString('es-AR')}** net (**${netoPct.toFixed(0)}%**).`
      : `De los **$${b.toLocaleString('es-AR')}** brutos del bono, **$${descTotal.toLocaleString('es-AR')}** se van en aportes + Ganancias y te quedan **$${Math.round(neto).toLocaleString('es-AR')}** netos (**${netoPct.toFixed(0)}%**).`,
    tone: netoPct < 60 ? 'warn' : netoPct < 75 ? 'neutral' : 'good',
    icon: '💸',
  } : undefined;
  const _chart = b>0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang==='en' ? 'Net bonus' : 'Bono neto', value: Math.round(neto) },
      { label: __lang==='en' ? 'Contributions (17%)' : 'Aportes (17%)', value: Math.round(aportes) },
      { label: __lang==='en' ? 'Income Tax' : 'Ganancias', value: Math.round(ret) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(neto).toLocaleString('es-AR')}`,
    centerLabel: __lang==='en' ? 'Net' : 'Neto',
    ariaLabel: __lang==='en'
      ? `Breakdown of the $${b.toLocaleString('es-AR')} gross bonus into net, contributions and Income Tax`
      : `Desglose del bono bruto de $${b.toLocaleString('es-AR')} en neto, aportes y Ganancias`,
  } : undefined;
  return { retencion:`$${Math.round(ret).toLocaleString('es-AR')}`, bonusNeto:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion, _insight, _chart };
}
