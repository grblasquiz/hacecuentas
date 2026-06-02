export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadEmpanadasPorInvitadoEvento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const total = Math.round(r);
  const docenas = r / 12;
  const conMargen = Math.ceil((r * 1.12) / 12);
  const insight = __lang === 'en'
    ? { title: 'How many to order', text: `You need about **${total} empanadas** (~**${docenas.toFixed(1)} dozen**). Add a ~12% safety margin and order **${conMargen} dozen** so you don't run short — and vary at least 3 fillings.`, tone: 'neutral', icon: '🥟' }
    : { title: 'Cuántas encargar', text: `Necesitás unas **${total} empanadas** (~**${docenas.toFixed(1)} docenas**). Sumá ~12% de margen y encargá **${conMargen} docenas** para no quedarte corto — y variá al menos 3 sabores.`, tone: 'neutral', icon: '🥟' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
