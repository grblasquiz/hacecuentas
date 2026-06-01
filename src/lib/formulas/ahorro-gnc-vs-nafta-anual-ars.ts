export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroGncVsNaftaAnualArs(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km=Number(i.km)||0; const kl=Number(i.kmL)||10; const km3=Number(i.kmM3)||12; const pn=Number(i.pN)||1; const pg=Number(i.pG)||0.5;
  const cn=km/kl*pn; const cg=km/km3*pg;
  const ahorroV = cn - cg;
  const pct = cn > 0 ? (ahorroV / cn) * 100 : 0;
  const resumen = __lang === 'en'
    ? `Gas $${cn.toFixed(0)} vs CNG $${cg.toFixed(0)}: savings $${(cn-cg).toFixed(0)}/year.`
    : `Nafta $${cn.toFixed(0)} vs GNC $${cg.toFixed(0)}: ahorro $${(cn-cg).toFixed(0)}/año.`;
  const _insight = __lang === 'en'
    ? { title: ahorroV >= 0 ? 'CNG wins' : 'Gas is cheaper here', text: ahorroV >= 0
        ? `Over **${km.toLocaleString('en-US')} km/year**, CNG costs **$${cg.toFixed(0)}** vs **$${cn.toFixed(0)}** on gasoline: you save **$${ahorroV.toFixed(0)}/year** (${pct.toFixed(0)}% less). That offsets the conversion over time.`
        : `With these prices, gasoline ($${cn.toFixed(0)}) beats CNG ($${cg.toFixed(0)}) by **$${Math.abs(ahorroV).toFixed(0)}/year**. Recheck the CNG price or your m³ efficiency.`,
        tone: ahorroV >= 0 ? 'good' : 'warn', icon: '⛽' }
    : { title: ahorroV >= 0 ? 'Gana el GNC' : 'Conviene la nafta', text: ahorroV >= 0
        ? `En **${km.toLocaleString('es-AR')} km/año**, el GNC sale **$${cg.toFixed(0)}** contra **$${cn.toFixed(0)}** en nafta: ahorrás **$${ahorroV.toFixed(0)}/año** (${pct.toFixed(0)}% menos). Con eso amortizás el equipo con el tiempo.`
        : `Con estos precios, la nafta ($${cn.toFixed(0)}) le gana al GNC ($${cg.toFixed(0)}) por **$${Math.abs(ahorroV).toFixed(0)}/año**. Revisá el precio del GNC o tu rendimiento por m³.`,
        tone: ahorroV >= 0 ? 'good' : 'warn', icon: '⛽' };
  return { costoN:`$${cn.toFixed(0)}`, costoG:`$${cg.toFixed(0)}`, ahorro:`$${(cn-cg).toFixed(0)}`, resumen, _insight };
}
