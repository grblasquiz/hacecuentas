export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroGncVsNaftaAnualArs(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km=Number(i.km)||0; const kl=Number(i.kmL)||10; const km3=Number(i.kmM3)||12; const pn=Number(i.pN)||1; const pg=Number(i.pG)||0.5;
  const cn=km/kl*pn; const cg=km/km3*pg;
  const resumen = __lang === 'en'
    ? `Gas $${cn.toFixed(0)} vs CNG $${cg.toFixed(0)}: savings $${(cn-cg).toFixed(0)}/year.`
    : `Nafta $${cn.toFixed(0)} vs GNC $${cg.toFixed(0)}: ahorro $${(cn-cg).toFixed(0)}/año.`;
  return { costoN:`$${cn.toFixed(0)}`, costoG:`$${cg.toFixed(0)}`, ahorro:`$${(cn-cg).toFixed(0)}`, resumen };
}
