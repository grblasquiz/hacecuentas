export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cajaSeguridadBancoComparativaMensual(i: Inputs): Outputs {
  const t=String(i.tamano||'mediana'); const b=String(i.banco||'privado_ar');
  const base:Record<string,number>={'chica':40000,'mediana':67000,'grande':110000,'premium':180000};
  const mult:Record<string,number>={'publico':0.6,'privado_ar':1,'privado_internacional':1.4};
  const cm=(base[t]||67000)*(mult[b]||1); const ca=cm*12;
  const cmF = Math.round(cm).toLocaleString('es-AR');
  const caF = Math.round(ca).toLocaleString('es-AR');
  const _insight = {
    title: 'Lo que te cuesta al año',
    text: `Una caja **${t}** en banco **${b.replace(/_/g,' ')}** sale **$${cmF}/mes**, o sea **$${caF}** al año. Casi todos los bancos cobran el alquiler por adelantado y suelen ajustarlo por inflación, así que tomalo como piso.`,
    tone: 'warn',
    icon: '🔒',
  };
  return { costoAnual:`$${caF}`, costoMensual:`$${cmF}`, interpretacion:`Caja ${t} en banco ${b}: ~$${cmF}/mes.`, _insight };
}
