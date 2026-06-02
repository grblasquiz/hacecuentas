export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadHamburguesasParrillaCumpleanos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const total = Math.round(r);
  const conMargen = Math.ceil(r * 1.15);
  const kgCarne = (conMargen * 0.13).toFixed(1);
  const insight = __lang === 'en'
    ? { title: 'Burgers to buy', text: `You need about **${total} burgers**. Add a 15% margin → buy **${conMargen}** (≈ **${kgCarne} kg** of ground beef if homemade, at 130 g each). Running short on the grill is harder to fix than a few leftovers.`, tone: 'neutral', icon: '🍔' }
    : __lang === 'pt'
    ? { title: 'Hambúrgueres a comprar', text: `Você precisa de cerca de **${total} hambúrgueres**. Some 15% de margem → compre **${conMargen}** (≈ **${kgCarne} kg** de carne moída se caseiros, a 130 g cada). Ficar sem na churrasqueira é mais difícil de resolver que sobrar.`, tone: 'neutral', icon: '🍔' }
    : { title: 'Hamburguesas a comprar', text: `Necesitás unas **${total} hamburguesas**. Sumá 15% de margen → comprá **${conMargen}** (≈ **${kgCarne} kg** de carne picada si son caseras, a 130 g c/u). Quedarte corto en la parrilla es más difícil de resolver que tener algunas de más.`, tone: 'neutral', icon: '🍔' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
