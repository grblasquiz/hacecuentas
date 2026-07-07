/** Calculadora de Snacks para Película */
export interface Inputs { duracionMin: number; personas: number; intensidad: string; __lang?: string; }
export interface Outputs { pochoclosLitros: number; bebidasLitros: number; snacksExtra: string; presupuesto: number; _insight?: any; _chart?: any; }

export function peliculaDuracionSnacks(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errDuracion: 'Ingresá la duración',
      errPersonas: 'Ingresá las personas',
      snackExtra: 'snacks extra para la segunda mitad',
      snackHeavy: 'pizza o empanadas para complementar',
      insTitle: 'Presupuesto de la maratón',
      chartCenter: 'Presupuesto',
      chartAria: 'Reparto del presupuesto entre pochoclos, bebidas y snacks',
      slPop: 'Pochoclos',
      slDrink: 'Bebidas',
      slOther: 'Snacks y golosinas',
    },
    en: {
      errDuracion: 'Enter the duration',
      errPersonas: 'Enter the number of people',
      snackExtra: 'extra snacks for the second half',
      snackHeavy: 'pizza or finger food to complement',
      insTitle: 'Movie-night budget',
      chartCenter: 'Budget',
      chartAria: 'Budget split across popcorn, drinks and snacks',
      slPop: 'Popcorn',
      slDrink: 'Drinks',
      slOther: 'Snacks & candy',
    },
  } as const)[__lang];

  const dur = Number(i.duracionMin);
  const pers = Number(i.personas);
  if (!dur || dur <= 0) throw new Error(T.errDuracion);
  if (!pers || pers < 1) throw new Error(T.errPersonas);

  const mult: Record<string, number> = { light: 0.7, normal: 1.0, heavy: 1.5 };
  const m = mult[i.intensidad] || 1;

  // Base: 2L pochoclos per person per 2 hours
  const pochoclosLitros = Number((pers * (dur / 120) * 2 * m).toFixed(1));
  // Base: 0.5L bebida per person per 2 hours
  const bebidasLitros = Number((pers * (dur / 120) * 0.5 * m).toFixed(1));

  const snacks: string[] = [];
  if (pers >= 3) snacks.push(__lang === 'en' ? `${Math.ceil(pers / 2)} bags of chips/nachos` : `${Math.ceil(pers / 2)} paquetes de papas/nachos`);
  if (dur > 150) snacks.push(T.snackExtra);
  if (i.intensidad === 'heavy') snacks.push(T.snackHeavy);
  snacks.push(__lang === 'en' ? `${pers} individual chocolates or candy bars` : `${pers} chocolates o alfajores individuales`);

  const presupuesto = Math.round((pochoclosLitros * 500 + bebidasLitros * 800 + pers * 1000) * m);

  // Reparto del presupuesto (las slices suman exacto el total; la 3ª absorbe el redondeo)
  const popPart = Math.round(pochoclosLitros * 500 * m);
  const drinkPart = Math.round(bebidasLitros * 800 * m);
  const otherPart = presupuesto - popPart - drinkPart;

  const _insight = {
    title: T.insTitle,
    text: __lang === 'en'
      ? `For ${pers} ${pers === 1 ? 'person' : 'people'} and a ${dur}-minute movie, plan about **$${presupuesto.toLocaleString('en-US')}**: roughly **${pochoclosLitros} L** of popcorn and **${bebidasLitros} L** of drinks.`
      : `Para ${pers} ${pers === 1 ? 'persona' : 'personas'} y una película de ${dur} minutos, calculá unos **$${presupuesto.toLocaleString('es-AR')}**: aproximadamente **${pochoclosLitros} L** de pochoclos y **${bebidasLitros} L** de bebida.`,
    tone: 'neutral',
    icon: '🍿',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: T.slPop, value: popPart },
      { label: T.slDrink, value: drinkPart },
      { label: T.slOther, value: otherPart },
    ],
    prefix: '$',
    centerValue: `$${presupuesto.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR')}`,
    centerLabel: T.chartCenter,
    ariaLabel: T.chartAria,
  };

  return { pochoclosLitros, bebidasLitros, snacksExtra: snacks.join('. '), presupuesto, _insight, _chart };
}
