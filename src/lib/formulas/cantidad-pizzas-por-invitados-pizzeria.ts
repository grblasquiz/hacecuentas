export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function cantidadPizzasPorInvitadosPizzeria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const adultos = Math.max(0, Number(i.adultos) || 0);
  const ninos   = Math.max(0, Number(i.ninos)   || 0);
  const ocasion = String(i.ocasion || 'principal');
  // slices_per_pizza: 6 (mediana), 8 (grande), 10 (extra-grande), 12 (familiar)
  const slicesPorPizza = Number(i.tamano_pizza) || 8;

  // Slices per person based on occasion
  let slicesAdulto: number;
  let slicesNino: number;

  switch (ocasion) {
    case 'aperitivo': // con picada / appetizers
      slicesAdulto = 2;
      slicesNino   = 1;
      break;
    case 'unico': // único plato, evento largo
      slicesAdulto = 4;
      slicesNino   = 2;
      break;
    case 'principal': // plato principal, sin otra comida relevante
    default:
      slicesAdulto = 3;
      slicesNino   = 2;
      break;
  }

  const totalSlices = adultos * slicesAdulto + ninos * slicesNino;
  // Add 10% safety margin, round up (ceiling)
  const conMargen = totalSlices * 1.10;
  const pizzasExactas = conMargen / slicesPorPizza;
  const pizzas = Math.ceil(pizzasExactas);

  // Minimum 1 if there are any guests
  const pizzasFinal = (adultos + ninos) > 0 ? Math.max(1, pizzas) : 0;

  // Flavor suggestion: min 3 flavors, roughly 1 flavor per 2 pizzas
  const sabores = Math.max(3, Math.ceil(pizzasFinal / 2));

  const ocasionLabel: Record<string, { es: string; en: string }> = {
    aperitivo:  { es: 'con picada/entrada previa', en: 'with appetizers' },
    principal:  { es: 'plato principal',            en: 'main dish'       },
    unico:      { es: 'único plato / evento largo', en: 'only dish / long event' },
  };
  const label = ocasionLabel[ocasion] || ocasionLabel['principal'];

  if (__lang === 'en') {
    const resumenStr = pizzasFinal === 0
      ? 'Enter at least 1 guest to get a result.'
      : `For ${adultos} adult${adultos !== 1 ? 's' : ''} + ${ninos} child${ninos !== 1 ? 'ren' : ''} (${label.en}): `
        + `${totalSlices} slices needed, ÷ ${slicesPorPizza} slices/pizza × 10% margin → order **${pizzasFinal} pizza${pizzasFinal !== 1 ? 's' : ''}**. `
        + `Aim for at least ${sabores} different toppings.`;

    const insight = {
      title: 'Pizzas to order',
      text: pizzasFinal === 0
        ? 'Enter the number of guests to calculate.'
        : `Order **${pizzasFinal} pizza${pizzasFinal !== 1 ? 's' : ''}** — that's ${totalSlices} slices plus a 10% buffer. `
          + `Offer at least **${sabores} different toppings** so everyone finds something they like. `
          + `Always round UP — running out of pizza is much worse than a few leftover slices.`,
      tone: 'neutral',
      icon: '🍕',
    };

    return {
      resultado: String(pizzasFinal),
      resumen: resumenStr,
      _insight: insight,
    };
  }

  // Spanish
  const resumenStr = pizzasFinal === 0
    ? 'Ingresá al menos 1 invitado para obtener el resultado.'
    : `Para ${adultos} adulto${adultos !== 1 ? 's' : ''} + ${ninos} niño${ninos !== 1 ? 's' : ''} (${label.es}): `
      + `${totalSlices} porciones necesarias ÷ ${slicesPorPizza} porciones/pizza × 10% margen → encargá **${pizzasFinal} pizza${pizzasFinal !== 1 ? 's' : ''}**. `
      + `Pedí al menos ${sabores} sabores distintos.`;

  const insight = {
    title: 'Pizzas a encargar',
    text: pizzasFinal === 0
      ? 'Ingresá la cantidad de invitados para calcular.'
      : `Encargá **${pizzasFinal} pizza${pizzasFinal !== 1 ? 's' : ''}** — eso son ${totalSlices} porciones más un margen del 10%. `
        + `Pedí al menos **${sabores} sabores distintos** para que nadie quede con una sola opción. `
        + `Siempre redondeá para arriba — que sobre es mejor que quedarse corto.`,
    tone: 'neutral',
    icon: '🍕',
  };

  return {
    resultado: String(pizzasFinal),
    resumen: resumenStr,
    _insight: insight,
  };
}
