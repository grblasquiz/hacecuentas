export interface Inputs {
  guests: number;
  hours: number;
  event_type: string;
  wine_price: number;
  beer_price: number;
  spirits_price: number;
}

export interface Outputs {
  total_drinks: number;
  wine_bottles: number;
  beers: number;
  spirits_liters: number;
  spirits_bottles: number;
  cost_low: number;
  cost_high: number;
  breakdown: string;
}

// Standard catering drink rate: 1 drink/guest/hr first 2 hrs, 0.5/hr after
const DRINK_RATE_FIRST = 1.0;   // drinks per guest per hour (first block)
const DRINK_RATE_AFTER = 0.5;   // drinks per guest per hour (remaining hours)
const FIRST_BLOCK_HOURS = 2;    // hours at full rate

// Drink-type mix (US average for mixed events — NIAAA / industry standard)
const WINE_SHARE    = 0.50;
const BEER_SHARE    = 0.30;
const SPIRITS_SHARE = 0.20;

// Conversion constants
const GLASSES_PER_WINE_BOTTLE = 5;     // 750 mL bottle at 5 oz standard pour
const LITERS_PER_SPIRIT_DRINK  = 0.0444; // 1.5 oz = ~44.4 mL per spirit drink
const ML_PER_SPIRIT_BOTTLE     = 750;  // standard 750 mL bottle

// Event-type multipliers (consumption tendency relative to standard wedding)
const EVENT_MULTIPLIERS: Record<string, number> = {
  wedding:  1.00,  // standard baseline
  cocktail: 1.15,  // drink-focused format, less food, higher consumption
  casual:   0.85,  // food competes, mixed audience, lower consumption
};

// Cost buffer for high estimate (covers spillage, extra guests, heavier drinkers)
const HIGH_ESTIMATE_BUFFER = 1.10;

export function compute(i: Inputs): Outputs {
  const guests       = Math.round(Number(i.guests)  || 0);
  const hours        = Number(i.hours)               || 0;
  const event_type   = i.event_type                  || "wedding";
  const wine_price   = Number(i.wine_price)          || 15;
  const beer_price   = Number(i.beer_price)          || 10;  // per 6-pack
  const spirits_price = Number(i.spirits_price)      || 25;  // per 750 mL bottle

  if (guests <= 0 || hours <= 0) {
    return {
      total_drinks:   0,
      wine_bottles:   0,
      beers:          0,
      spirits_liters: 0,
      spirits_bottles: 0,
      cost_low:       0,
      cost_high:      0,
      breakdown:      "Enter a valid number of guests and event duration.",
    };
  }

  const multiplier = EVENT_MULTIPLIERS[event_type] ?? 1.0;

  // Step 1: Calculate raw total drinks
  const firstBlockHours     = Math.min(hours, FIRST_BLOCK_HOURS);
  const remainingHours      = Math.max(hours - FIRST_BLOCK_HOURS, 0);
  const drinksFirstBlock    = guests * DRINK_RATE_FIRST * firstBlockHours;
  const drinksRemainingBlock = guests * DRINK_RATE_AFTER * remainingHours;
  const rawDrinks           = drinksFirstBlock + drinksRemainingBlock;
  const totalDrinks         = Math.round(rawDrinks * multiplier);

  // Step 2: Split by drink type
  const wineDrinks    = totalDrinks * WINE_SHARE;
  const beerDrinks    = totalDrinks * BEER_SHARE;
  const spiritDrinks  = totalDrinks * SPIRITS_SHARE;

  // Step 3: Convert to purchasable units
  const wineBottles    = Math.ceil(wineDrinks / GLASSES_PER_WINE_BOTTLE);
  const beers          = Math.ceil(beerDrinks);          // 1 can = 1 drink
  const spiritsLiters  = parseFloat((spiritDrinks * LITERS_PER_SPIRIT_DRINK).toFixed(2));
  const spiritsBottles = Math.ceil((spiritDrinks * LITERS_PER_SPIRIT_DRINK * 1000) / ML_PER_SPIRIT_BOTTLE);

  // Step 4: Cost estimate
  const wineCost    = wineBottles * wine_price;
  const beerCost    = Math.ceil(beers / 6) * beer_price;  // buy by the 6-pack
  const spiritsCost = spiritsBottles * spirits_price;
  const costLow     = parseFloat((wineCost + beerCost + spiritsCost).toFixed(2));
  const costHigh    = parseFloat((costLow * HIGH_ESTIMATE_BUFFER).toFixed(2));

  // Step 5: Human-readable breakdown
  const eventLabel: Record<string, string> = {
    wedding:  "Wedding / Formal Reception",
    cocktail: "Cocktail Party",
    casual:   "Casual Party / BBQ",
  };
  const sixPacksNeeded = Math.ceil(beers / 6);
  const breakdown = [
    `Event: ${eventLabel[event_type] ?? event_type} (×${multiplier.toFixed(2)} multiplier)`,
    `Duration: ${hours} hr${hours !== 1 ? "s" : ""} | Guests: ${guests}`,
    `Total drinks: ${totalDrinks} (${Math.round(wineDrinks)} wine + ${Math.round(beerDrinks)} beer + ${Math.round(spiritDrinks)} spirits)`,
    `Wine: ${wineBottles} bottle${wineBottles !== 1 ? "s" : ""} (750 mL, 5 oz pour)`,
    `Beer: ${beers} can${beers !== 1 ? "s" : ""} / ${sixPacksNeeded} six-pack${sixPacksNeeded !== 1 ? "s" : ""}`,
    `Spirits: ${spiritsLiters} L → ${spiritsBottles} bottle${spiritsBottles !== 1 ? "s" : ""} (750 mL each)`,
    `Cost low = $${costLow.toFixed(2)} | Cost high (+10% buffer) = $${costHigh.toFixed(2)}`,
    "Note: does not include mixers, ice, or non-alcoholic beverages.",
  ].join("\n");

  return {
    total_drinks:    totalDrinks,
    wine_bottles:    wineBottles,
    beers,
    spirits_liters:  spiritsLiters,
    spirits_bottles: spiritsBottles,
    cost_low:        costLow,
    cost_high:       costHigh,
    breakdown,
  };
}
