export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bonusAnualMarcoFiscalNeto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const b=Number(i.bonusBruto)||0; const a=Number(i.alicuotaGanancias)||0;
  const aportes=b*0.17; const netoAportes=b-aportes; const ret=netoAportes*a/100; const neto=netoAportes-ret;
  const interpretacion = __lang === 'en'
    ? `Gross $${b.toLocaleString('es-AR')} - social contributions 17% - Income Tax ${a}% = Net $${Math.round(neto).toLocaleString('es-AR')} (${(neto/b*100).toFixed(0)}% of gross).`
    : `Bruto $${b.toLocaleString('es-AR')} - aportes 17% - Ganancias ${a}% = Neto $${Math.round(neto).toLocaleString('es-AR')} (${(neto/b*100).toFixed(0)}% del bruto).`;
  return { retencion:`$${Math.round(ret).toLocaleString('es-AR')}`, bonusNeto:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion };
}
