export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Cooking time data (minutes) sourced from:
// - Rouxbe Online Culinary School (rouxbe.com)
// - Betty Crocker Fresh Vegetable Cooking Chart (bettycrocker.com)
// - Fine Dining Lovers vegetable cooking times chart (finedininglovers.com)
// - HealWithFood steaming times chart (healwithfood.org)
// Format: [steamMin, steamMax, boilMin, boilMax, sizeTip]
const VEGGIE_DATA: Record<string, [number, number, number, number, string]> = {
  asparagus:       [3,  8,  4,  8,  "Snap off woody ends; thin spears on the low end, thick on the high end."],
  beetroot:        [30, 40, 30, 45, "Leave 1 inch of stem on; pierce with a skewer to test."],
  broccoli:        [4,  6,  5,  8,  "Cut into similar-sized florets; florets cook faster than spears."],
  brussels_sprouts:[10, 12, 8,  12, "Halve for faster cooking; don't pierce until done or they waterlog."],
  cabbage:         [6,  10, 8,  12, "Cut into wedges for boiling; shred for quick steaming."],
  carrot:          [5,  8,  5,  10, "Slice 1/4-inch thick; whole baby carrots take longer."],
  cauliflower:     [4,  6,  5,  10, "Break into equal florets; whole head takes 15–20 min."],
  corn:            [8,  12, 4,  7,  "Shuck fully; boiling in the husk isn't recommended."],
  eggplant:        [10, 15, 5,  10, "Cube or slice; salt before cooking to reduce bitterness."],
  green_beans:     [5,  8,  5,  8,  "Trim both ends; thinner beans on the low end."],
  kale:            [3,  5,  3,  5,  "Remove stems; leaves wilt quickly—check at 3 min."],
  leek:            [8,  12, 8,  12, "Split lengthwise; rinse well before cooking."],
  peas:            [2,  4,  2,  4,  "Fresh shelled peas only; frozen are pre-blanched, reduce by 1–2 min."],
  potato_cubed:    [15, 20, 12, 18, "1-inch cubes; smaller pieces will be done closer to the low end."],
  potato_whole:    [25, 35, 20, 30, "Medium (7 oz) potato; large can take 5–10 min more."],
  spinach:         [2,  3,  2,  3,  "Add to boiling water or a covered steamer; it wilts immediately."],
  sweet_corn:      [8,  12, 4,  6,  "Ear of corn; ensure water covers the cob fully when boiling."],
  sweet_potato:    [20, 30, 20, 28, "Cubed sweet potato cooks 10–15 min; whole takes the full range."],
  turnip:          [12, 18, 10, 15, "Peel and cube; turnips soften faster than potatoes."],
  zucchini:        [3,  5,  3,  5,  "Slice 1/2-inch thick; overcooks quickly—check early."],
};

const VEGGIE_LABELS: Record<string, { en: string; pt: string; es: string }> = {
  asparagus:       { en: "Asparagus",       pt: "Aspargos",       es: "Espárragos" },
  beetroot:        { en: "Beetroot",         pt: "Beterraba",      es: "Remolacha" },
  broccoli:        { en: "Broccoli",         pt: "Brócolis",       es: "Brócoli" },
  brussels_sprouts:{ en: "Brussels Sprouts", pt: "Couve-de-Bruxelas",es: "Coles de Bruselas" },
  cabbage:         { en: "Cabbage",          pt: "Repolho",        es: "Repollo" },
  carrot:          { en: "Carrot",           pt: "Cenoura",        es: "Zanahoria" },
  cauliflower:     { en: "Cauliflower",      pt: "Couve-flor",     es: "Coliflor" },
  corn:            { en: "Corn (off cob)",   pt: "Milho (em grão)",es: "Choclo (en grano)" },
  eggplant:        { en: "Eggplant",         pt: "Berinjela",      es: "Berenjena" },
  green_beans:     { en: "Green Beans",      pt: "Vagem",          es: "Judías verdes" },
  kale:            { en: "Kale",             pt: "Couve",          es: "Col rizada" },
  leek:            { en: "Leek",             pt: "Alho-poró",      es: "Puerro" },
  peas:            { en: "Peas (fresh)",     pt: "Ervilha (fresca)",es: "Arvejas (frescas)" },
  potato_cubed:    { en: "Potato (cubed)",   pt: "Batata (cubos)", es: "Papa (en cubos)" },
  potato_whole:    { en: "Potato (whole, medium)", pt: "Batata (inteira, média)", es: "Papa (entera, mediana)" },
  spinach:         { en: "Spinach",          pt: "Espinafre",      es: "Espinaca" },
  sweet_corn:      { en: "Sweet Corn (ear)", pt: "Espiga de milho",es: "Mazorca de maíz" },
  sweet_potato:    { en: "Sweet Potato",     pt: "Batata-doce",    es: "Batata dulce" },
  turnip:          { en: "Turnip",           pt: "Nabo",           es: "Nabo" },
  zucchini:        { en: "Zucchini",         pt: "Abobrinha",      es: "Zapallito" },
};

export function tiemposCoccionVerdurasAlVaporHervido(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const vegKey = String(i.v1 || 'broccoli');
  // v2: 1 = steamed, 2 = boiled
  const method = Number(i.v2) === 2 ? 'boiled' : 'steamed';

  const data = VEGGIE_DATA[vegKey] ?? VEGGIE_DATA['broccoli'];
  const [steamMin, steamMax, boilMin, boilMax, sizeTip] = data;

  const tMin = method === 'steamed' ? steamMin : boilMin;
  const tMax = method === 'steamed' ? steamMax : boilMax;
  const midpoint = Math.round((tMin + tMax) / 2);

  const vegLabel = VEGGIE_LABELS[vegKey]
    ? VEGGIE_LABELS[vegKey][__lang]
    : vegKey;

  // Method labels
  const methodLabel = {
    en: method === 'steamed' ? 'Steamed' : 'Boiled',
    pt: method === 'steamed' ? 'No vapor' : 'Fervido',
    es: method === 'steamed' ? 'Al vapor' : 'Hervido',
  }[__lang];

  // Result string
  const resultado =
    __lang === 'en'
      ? `${tMin}–${tMax} min`
      : __lang === 'pt'
      ? `${tMin}–${tMax} min`
      : `${tMin}–${tMax} min`;

  // Nutrient note: steaming preserves more nutrients
  const nutrientNote = {
    en: method === 'steamed'
      ? 'Steaming preserves significantly more water-soluble vitamins (C, B1, folate) than boiling.'
      : 'Boiling leaches water-soluble vitamins into the cooking water. Use the water in soups or sauces to recover nutrients.',
    pt: method === 'steamed'
      ? 'Cozinhar no vapor preserva muito mais vitaminas hidrossolúveis (C, B1, folato) do que ferver.'
      : 'Ferver lixivia vitaminas hidrossolúveis para a água de cozimento. Use essa água em sopas ou molhos para recuperar nutrientes.',
    es: method === 'steamed'
      ? 'Cocinar al vapor preserva significativamente más vitaminas hidrosolubles (C, B1, folato) que hervir.'
      : 'Hervir lixivia las vitaminas hidrosolubles al agua de cocción. Aprovechá esa agua en sopas o salsas para no desperdiciar nutrientes.',
  }[__lang];

  const resumen =
    __lang === 'en'
      ? `${vegLabel} ${methodLabel.toLowerCase()}: **${tMin}–${tMax} minutes**. Typical target: ${midpoint} min. ${sizeTip}`
      : __lang === 'pt'
      ? `${vegLabel} ${methodLabel.toLowerCase()}: **${tMin}–${tMax} minutos**. Ponto ideal: ${midpoint} min. ${sizeTip}`
      : `${vegLabel} ${methodLabel.toLowerCase()}: **${tMin}–${tMax} minutos**. Punto ideal: ${midpoint} min. ${sizeTip}`;

  const _insight = {
    title: {
      en: `${vegLabel} — ${methodLabel}`,
      pt: `${vegLabel} — ${methodLabel}`,
      es: `${vegLabel} — ${methodLabel}`,
    }[__lang],
    text: {
      en: `Cook for **${tMin}–${tMax} minutes** (aim for ${midpoint} min). ${sizeTip} ${nutrientNote}`,
      pt: `Cozinhe por **${tMin}–${tMax} minutos** (aponte para ${midpoint} min). ${sizeTip} ${nutrientNote}`,
      es: `Cocinás por **${tMin}–${tMax} minutos** (apuntá a ${midpoint} min). ${sizeTip} ${nutrientNote}`,
    }[__lang],
    tone: 'neutral',
    icon: '🥦',
  };

  return { resultado, resumen, _insight };
}
