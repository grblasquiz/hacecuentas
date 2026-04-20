export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cajaSeguridadBancoComparativaMensual(i: Inputs): Outputs {
  const t=String(i.tamano||'mediana'); const b=String(i.banco||'privado_ar');
  const base:Record<string,number>={'chica':40000,'mediana':67000,'grande':110000,'premium':180000};
  const mult:Record<string,number>={'publico':0.6,'privado_ar':1,'privado_internacional':1.4};
  const cm=(base[t]||67000)*(mult[b]||1); const ca=cm*12;
  return { costoAnual:`$${Math.round(ca).toLocaleString('es-AR')}`, costoMensual:`$${Math.round(cm).toLocaleString('es-AR')}`, interpretacion:`Caja ${t} en banco ${b}: ~$${Math.round(cm).toLocaleString('es-AR')}/mes.` };
}
