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

// Localized size/prep tips (pt/es); English source of truth lives in VEGGIE_DATA[4]
const VEGGIE_TIPS_I18N: Record<string, { pt: string; es: string }> = {
  asparagus:       { pt: "Quebre a base fibrosa; talos finos no tempo mínimo, grossos no máximo.", es: "Cortá la base leñosa; los espárragos finos van al rango bajo, los gruesos al alto." },
  beetroot:        { pt: "Deixe 2–3 cm de talo; espete com um palito para testar o ponto.", es: "Dejá 2–3 cm de tallo; pinchá con un palillo para probar el punto." },
  broccoli:        { pt: "Corte em floretes de tamanho parecido; floretes cozinham mais rápido que os talos.", es: "Cortá en flores de tamaño parejo; las flores se cocinan más rápido que los tallos." },
  brussels_sprouts:{ pt: "Corte ao meio para acelerar; não fure antes da hora ou encharcam.", es: "Cortalas a la mitad para acelerar; no las pinches antes de tiempo o se llenan de agua." },
  cabbage:         { pt: "Em gomos para ferver; fatiado fino para um vapor rápido.", es: "En cascos para hervir; en juliana para un vapor rápido." },
  carrot:          { pt: "Rodelas de ~6 mm; cenouras baby inteiras demoram mais.", es: "Rodajas de ~6 mm; las zanahorias baby enteras tardan más." },
  cauliflower:     { pt: "Separe em floretes iguais; a cabeça inteira leva 15–20 min.", es: "Separá en flores parejas; la cabeza entera tarda 15–20 min." },
  corn:            { pt: "Sem palha; não é recomendado ferver com a palha.", es: "Sin chala; no conviene hervirlo con la chala." },
  eggplant:        { pt: "Em cubos ou fatias; salgue antes para reduzir o amargor.", es: "En cubos o rodajas; salala antes para reducir el amargor." },
  green_beans:     { pt: "Apare as duas pontas; vagens mais finas no tempo mínimo.", es: "Despuntá ambos extremos; las más finas van al rango bajo." },
  kale:            { pt: "Retire os talos; as folhas murcham rápido — confira aos 3 min.", es: "Sacá los tallos; las hojas se ablandan rápido — revisá a los 3 min." },
  leek:            { pt: "Corte ao comprido e lave bem antes de cozinhar.", es: "Cortalo a lo largo y lavalo bien antes de cocinar." },
  peas:            { pt: "Apenas ervilhas frescas; as congeladas já vêm branqueadas, reduza 1–2 min.", es: "Sólo arvejas frescas; las congeladas vienen blanqueadas, restá 1–2 min." },
  potato_cubed:    { pt: "Cubos de ~2,5 cm; pedaços menores ficam prontos no tempo mínimo.", es: "Cubos de ~2,5 cm; los trozos más chicos están listos en el rango bajo." },
  potato_whole:    { pt: "Batata média (~200 g); uma grande pode levar 5–10 min a mais.", es: "Papa mediana (~200 g); una grande puede tardar 5–10 min más." },
  spinach:         { pt: "Adicione à água fervente ou ao vapor tampado; murcha na hora.", es: "Agregala al agua hirviendo o a la vaporera tapada; se reduce al instante." },
  sweet_corn:      { pt: "Espiga inteira; garanta que a água cubra todo o milho ao ferver.", es: "Choclo entero; asegurate de que el agua cubra toda la mazorca al hervir." },
  sweet_potato:    { pt: "Em cubos leva 10–15 min; inteira usa o tempo completo.", es: "En cubos tarda 10–15 min; entera usa el rango completo." },
  turnip:          { pt: "Descasque e corte em cubos; o nabo amolece mais rápido que a batata.", es: "Pelá y cortá en cubos; el nabo se ablanda más rápido que la papa." },
  zucchini:        { pt: "Rodelas de ~1 cm; passa do ponto rápido — confira cedo.", es: "Rodajas de ~1 cm; se pasa rápido — probá temprano." },
};

export function tiemposCoccionVerdurasAlVaporHervido(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const vegKey = String(i.v1 || 'broccoli');
  // v2: 1 = steamed, 2 = boiled
  const method = Number(i.v2) === 2 ? 'boiled' : 'steamed';

  const data = VEGGIE_DATA[vegKey] ?? VEGGIE_DATA['broccoli'];
  const [steamMin, steamMax, boilMin, boilMax, sizeTipEn] = data;
  const tipKey = VEGGIE_DATA[vegKey] ? vegKey : 'broccoli';
  const sizeTip = __lang === 'en'
    ? sizeTipEn
    : (VEGGIE_TIPS_I18N[tipKey] ? VEGGIE_TIPS_I18N[tipKey][__lang] : sizeTipEn);

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

  // Frase de método para texto corrido (neutra en género: "Zanahoria hervido" suena mal)
  const methodPhrase = {
    en: method === 'steamed' ? 'steamed' : 'boiled',
    pt: method === 'steamed' ? 'no vapor' : 'em água fervente',
    es: method === 'steamed' ? 'al vapor' : 'en agua hirviendo',
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
      ? `${vegLabel} ${methodPhrase}: **${tMin}–${tMax} minutes**. Typical target: ${midpoint} min. ${sizeTip}`
      : __lang === 'pt'
      ? `${vegLabel} ${methodPhrase}: **${tMin}–${tMax} minutos**. Ponto ideal: ${midpoint} min. ${sizeTip}`
      : `${vegLabel} ${methodPhrase}: **${tMin}–${tMax} minutos**. Punto ideal: ${midpoint} min. ${sizeTip}`;

  const _insight = {
    title: {
      en: `${vegLabel} — ${methodLabel}`,
      pt: `${vegLabel} — ${methodLabel}`,
      es: `${vegLabel} — ${methodLabel}`,
    }[__lang],
    text: {
      en: `Cook for **${tMin}–${tMax} minutes** (aim for ${midpoint} min). ${sizeTip} ${nutrientNote}`,
      pt: `Cozinhe por **${tMin}–${tMax} minutos** (o ideal são ${midpoint} min). ${sizeTip} ${nutrientNote}`,
      es: `Cociná **${tMin}–${tMax} minutos** (apuntá a ${midpoint} min). ${sizeTip} ${nutrientNote}`,
    }[__lang],
    tone: 'neutral',
    icon: '🥦',
  };

  return { resultado, resumen, _insight };
}
