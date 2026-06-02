export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadPizzasPorInvitadosPizzeria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumenStr = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const total = Math.round(r);
  const pizzasGrandes = Math.ceil((r * 1.1) / 8);
  const insight = __lang === 'en'
    ? { title: 'Pizzas to order', text: `That's about **${total} servings**. At 8 slices per large pizza plus a 10% margin, order **${pizzasGrandes} large pizzas** — and pick at least 3 different flavors so nobody's stuck with just mozzarella.`, tone: 'neutral', icon: '🍕' }
    : { title: 'Pizzas a encargar', text: `Eso son unas **${total} porciones**. A 8 porciones por pizza grande más 10% de margen, encargá **${pizzasGrandes} pizzas grandes** — y pedí al menos 3 sabores distintos para que nadie quede solo con muzza.`, tone: 'neutral', icon: '🍕' };
  return { resultado:r.toFixed(2), resumen:resumenStr, _insight: insight };
}
