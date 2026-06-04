export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Pizza dough calculator using baker's percentage.
 * Sources:
 *  - AVPN (Associazione Verace Pizza Napoletana) International Regulation 2022
 *  - PMQ Pizza / Dough Doctor baker's percentage method
 *  - Standard Argentine molde pizza tradition (300 g dough ball, 60% hydration)
 *
 * Baker's percentage: flour = 100%, all other ingredients expressed as % of flour weight.
 * Standard ratios:
 *   Water (hydration): configurable, default 60%
 *   Salt: 2% of flour
 *   Oil: 3% of flour (omitted in Neapolitan style)
 *   Dry yeast: 1% of flour (instant/active dry)
 *   Fresh yeast: 3% of flour (= dry yeast × 3)
 *
 * Dough ball weights by style:
 *   molde   : 300 g (Argentine molde 36 cm, 8 slices, 4 people)
 *   napolitana: 250 g (AVPN 30 cm standard, 2-3 people)
 *   fina    : 220 g (thin crust, 2-3 people)
 *   fugazza : 380 g (Argentine fugazza/focaccia, 6 people)
 */
export function masaPizzaCaseraGramosInvitados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const numGuests = Math.max(1, Math.round(Number(i.num_guests) || 4));
  const hydrationPct = Math.min(80, Math.max(50, Number(i.hydration) || 60));
  const style = String(i.pizza_style || 'molde');

  // Dough ball weight & people per pizza by style
  type StyleDef = { doughG: number; peoplePerPizza: number; hasOil: boolean };
  const styles: Record<string, StyleDef> = {
    molde:      { doughG: 300, peoplePerPizza: 4, hasOil: true },
    napolitana: { doughG: 250, peoplePerPizza: 3, hasOil: false },
    fina:       { doughG: 220, peoplePerPizza: 3, hasOil: true },
    fugazza:    { doughG: 380, peoplePerPizza: 6, hasOil: true },
  };
  const def = styles[style] ?? styles['molde'];

  const numPizzas = Math.ceil(numGuests / def.peoplePerPizza);

  // Baker's percentage: total dough = flour × (1 + hydration + salt% + oil% + yeast%)
  // Solving for flour: flour = doughPerBall / (1 + hydration/100 + 0.02 + (hasOil ? 0.03 : 0) + 0.01)
  const saltPct = 0.02;
  const oilPct = def.hasOil ? 0.03 : 0;
  const yeastPct = 0.01; // dry instant yeast

  const divisor = 1 + hydrationPct / 100 + saltPct + oilPct + yeastPct;
  const flourPerPizza = def.doughG / divisor;

  const totalFlour = Math.round(flourPerPizza * numPizzas);
  const totalWater = Math.round(totalFlour * hydrationPct / 100);
  const totalSalt = Math.round(totalFlour * saltPct * 10) / 10;   // 1 decimal
  const totalOil = def.hasOil ? Math.round(totalFlour * oilPct * 10) / 10 : 0;
  const totalDryYeast = Math.round(totalFlour * yeastPct * 10) / 10;
  const totalFreshYeast = Math.round(totalDryYeast * 3 * 10) / 10;
  const totalDough = Math.round(def.doughG * numPizzas);

  const resultado = totalDough;

  // Human-readable summary
  let resumen: string;
  if (__lang === 'en') {
    const oilLine = def.hasOil ? ` · Oil ${totalOil} g` : '';
    resumen = `${numPizzas} pizza${numPizzas > 1 ? 's' : ''} · Flour ${totalFlour} g · Water ${totalWater} ml · Salt ${totalSalt} g · Dry yeast ${totalDryYeast} g (or fresh yeast ${totalFreshYeast} g)${oilLine}`;
  } else {
    const oilLine = def.hasOil ? ` · Aceite ${totalOil} g` : '';
    resumen = `${numPizzas} pizza${numPizzas > 1 ? 's' : ''} · Harina ${totalFlour} g · Agua ${totalWater} ml · Sal ${totalSalt} g · Levadura seca ${totalDryYeast} g (o fresca ${totalFreshYeast} g)${oilLine}`;
  }

  // Insight block
  const insight = __lang === 'en'
    ? {
        title: 'Ingredient Breakdown',
        text: `For **${numGuests} guest${numGuests > 1 ? 's' : ''}** you need **${numPizzas} pizza${numPizzas > 1 ? 's' : ''}**: **${totalFlour} g flour**, ${totalWater} ml water, ${totalSalt} g salt, ${totalDryYeast} g dry yeast${def.hasOil ? `, ${totalOil} g oil` : ''}. Hydration: ${hydrationPct}%.`,
        tone: 'positive',
        icon: '🍕',
      }
    : {
        title: 'Desglose de ingredientes',
        text: `Para **${numGuests} invitado${numGuests > 1 ? 's' : ''}** necesitás **${numPizzas} pizza${numPizzas > 1 ? 's' : ''}**: **${totalFlour} g de harina**, ${totalWater} ml de agua, ${totalSalt} g de sal, ${totalDryYeast} g de levadura seca${def.hasOil ? `, ${totalOil} g de aceite` : ''}. Hidratación: ${hydrationPct}%.`,
        tone: 'positive',
        icon: '🍕',
      };

  return { resultado, resumen, _insight: insight };
}
