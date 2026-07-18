/**
 * Sourdough hydration (baker's percentage) — a diferencia de una masa con levadura,
 * el starter/levain aporta harina Y agua que cuentan en la hidratación total. Esta
 * fórmula descompone el starter y calcula cuánta agua AGREGAR para alcanzar la
 * hidratación objetivo, más la sal y el peso total de la masa. Fórmula pura.
 */

export interface Inputs {
  flour: number;              // gramos de harina que agregás (sin contar el starter)
  starter_weight: number;     // gramos de starter/levain
  starter_hydration: number;  // % de hidratación del starter (100 = 1:1 harina:agua)
  target_hydration: number;   // % de hidratación total de la masa
  salt_pct: number;           // % de sal sobre la harina total
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function r0(n: number): number { return Math.round(n); }
function r1(n: number): number { return Math.round(n * 10) / 10; }

function hydrationClass(h: number): string {
  if (h < 65) return 'Stiff (<65%) — easy to shape, tighter crumb';
  if (h < 75) return 'Standard (65–74%) — reliable, all-purpose';
  if (h < 85) return 'High (75–84%) — open crumb, needs handling skill';
  return 'Very high (≥85%) — very open, slack and sticky';
}

export function compute(i: Inputs): Outputs {
  const flour = Math.max(0, Number(i.flour) || 0);
  const starterWeight = Math.max(0, Number(i.starter_weight) || 0);
  const starterHyd = Math.max(0, Number(i.starter_hydration) || 100);
  const targetHyd = Math.max(0, Number(i.target_hydration) || 0);
  const saltPct = Math.max(0, Number(i.salt_pct) || 0);

  if (flour <= 0) throw new Error('Enter the amount of flour (grams)');
  if (targetHyd <= 0) throw new Error('Enter your target dough hydration (%)');

  // El starter se descompone en su harina y su agua.
  const starterFlour = starterWeight / (1 + starterHyd / 100);
  const starterWater = starterWeight - starterFlour;

  const totalFlour = flour + starterFlour;
  const totalWaterTarget = totalFlour * (targetHyd / 100);
  const waterToAdd = totalWaterTarget - starterWater;
  const salt = totalFlour * (saltPct / 100);
  const totalDough = totalFlour + totalWaterTarget + salt;

  const starterPctOfFlour = totalFlour > 0 ? (starterFlour / totalFlour) * 100 : 0;
  const negativeWater = waterToAdd < 0;

  const _insight = {
    title: negativeWater ? 'Your starter already exceeds this hydration' : `Add ${r0(waterToAdd)} g of water`,
    text: negativeWater
      ? `Your **${r0(starterWeight)} g** of starter alone provides more water than a **${targetHyd}%** dough needs at this flour weight. Either raise the target hydration, add more flour, or use less starter. The starter contributes **${r0(starterFlour)} g flour** and **${r0(starterWater)} g water**.`
      : `For **${r0(flour)} g of added flour** plus **${r0(starterWeight)} g of starter** (which brings ${r0(starterFlour)} g flour + ${r0(starterWater)} g water), add **${r0(waterToAdd)} g of water** and **${r1(salt)} g of salt** to hit **${targetHyd}% hydration**. Total dough ≈ **${r0(totalDough)} g**. Your starter is **${r1(starterPctOfFlour)}%** of total flour — ${hydrationClass(targetHyd)}.`,
    tone: negativeWater ? 'warn' : 'good',
    icon: '🍞',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Flour (added)', value: r0(flour) },
      { label: 'Water to add', value: r0(Math.max(0, waterToAdd)) },
      { label: 'Starter', value: r0(starterWeight) },
      { label: 'Salt', value: r1(salt) },
    ],
    prefix: '',
    centerValue: `${r0(totalDough)} g`,
    centerLabel: 'Total dough',
    ariaLabel: `Dough: ${r0(flour)} g added flour, ${r0(Math.max(0, waterToAdd))} g water to add, ${r0(starterWeight)} g starter, ${r1(salt)} g salt, total ${r0(totalDough)} g.`,
  };

  return {
    water_to_add: r0(waterToAdd) + ' g',
    total_flour: r0(totalFlour) + ' g',
    total_water: r0(totalWaterTarget) + ' g',
    salt_g: r1(salt) + ' g',
    total_dough: r0(totalDough) + ' g',
    starter_flour: r0(starterFlour) + ' g',
    starter_water: r0(starterWater) + ' g',
    hydration_class: hydrationClass(targetHyd),
    breakdown: `Starter ${r0(starterWeight)} g = ${r0(starterFlour)} g flour + ${r0(starterWater)} g water. Total flour ${r0(totalFlour)} g × ${targetHyd}% = ${r0(totalWaterTarget)} g target water. Water to add = ${r0(totalWaterTarget)} − ${r0(starterWater)} = ${r0(waterToAdd)} g. Salt = ${r1(salt)} g.`,
    _insight,
    _chart,
  };
}
