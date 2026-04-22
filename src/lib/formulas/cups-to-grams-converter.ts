/**
 * Cups to grams converter — generic baking ingredients (US cup = 240 ml).
 *
 * Density table sourced from USDA FoodData Central and King Arthur Baking
 * Company reference weights. Values represent 1 US cup of each ingredient:
 *
 *   - flour (all-purpose):         120 g
 *   - bread flour:                 127 g
 *   - whole wheat flour:           113 g
 *   - cake flour:                  114 g
 *   - granulated sugar (white):    200 g
 *   - brown sugar (packed):        213 g
 *   - powdered sugar:              120 g
 *   - butter:                      227 g
 *   - oil (vegetable):             218 g
 *   - honey:                       340 g
 *   - milk:                        245 g
 *   - water:                       237 g
 *   - rice (uncooked):             200 g
 *   - oats (rolled):                85 g
 *   - cocoa powder:                 85 g
 *   - chocolate chips:             170 g
 *   - chopped nuts:                115 g
 *
 * Formula: grams = cups × densityTable[ingredient]
 */

export interface Inputs {
  cups: number;
  ingredient: string;
}
export interface Outputs {
  grams: string;
  ounces: string;
  tablespoons: string;
  detail: string;
  summary: string;
}

const DENSITY_G_PER_CUP: Record<string, { label: string; g: number }> = {
  'flour': { label: 'All-purpose flour', g: 120 },
  'bread-flour': { label: 'Bread flour', g: 127 },
  'whole-wheat': { label: 'Whole wheat flour', g: 113 },
  'cake-flour': { label: 'Cake flour', g: 114 },
  'sugar': { label: 'Granulated sugar', g: 200 },
  'brown-sugar': { label: 'Brown sugar (packed)', g: 213 },
  'powdered-sugar': { label: 'Powdered sugar', g: 120 },
  'butter': { label: 'Butter', g: 227 },
  'oil': { label: 'Vegetable oil', g: 218 },
  'honey': { label: 'Honey', g: 340 },
  'milk': { label: 'Milk', g: 245 },
  'water': { label: 'Water', g: 237 },
  'rice': { label: 'Rice (uncooked)', g: 200 },
  'oats': { label: 'Rolled oats', g: 85 },
  'cocoa': { label: 'Cocoa powder', g: 85 },
  'choc-chips': { label: 'Chocolate chips', g: 170 },
  'nuts': { label: 'Chopped nuts', g: 115 },
};

export function cupsToGramsConverter(i: Inputs): Outputs {
  const cups = Number(i.cups);
  const ingKey = String(i.ingredient || 'flour').toLowerCase();
  if (!Number.isFinite(cups) || cups <= 0) {
    throw new Error('Enter a positive number of cups');
  }
  const d = DENSITY_G_PER_CUP[ingKey] || DENSITY_G_PER_CUP['flour'];
  const grams = cups * d.g;
  const ounces = grams / 28.3495; // US oz
  const tbsp = cups * 16;         // 1 cup = 16 tbsp

  return {
    grams: grams.toFixed(1),
    ounces: ounces.toFixed(2),
    tablespoons: tbsp.toFixed(0),
    detail: `${cups} cup${cups === 1 ? '' : 's'} of ${d.label} = ${grams.toFixed(1)} g (≈ ${ounces.toFixed(2)} oz, or ${tbsp.toFixed(0)} tbsp). Density: ${d.g} g per cup.`,
    summary: `${cups} cup → ${grams.toFixed(1)} g`,
  };
}
