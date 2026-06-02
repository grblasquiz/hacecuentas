/**
 * Calorías de huevo según el método de cocción (revuelto / frito / cocido…).
 * Un huevo grande (~50 g) aporta ~75 kcal; el resto lo suma la grasa de cocción.
 * Tabla de referencia (kcal por huevo grande). Fuente: USDA FoodData Central
 *   (huevo entero crudo ~72 kcal, duro ~78, frito en grasa ~90) más el aceite/manteca de cada preparación.
 */
export interface Inputs { metodo?: string; cantidad?: number | string; __lang?: string; [k: string]: number | string | undefined; }
export interface Outputs { caloriasTotal: number; caloriasPorHuevo: number; resumen: string; _chart?: any; _insight?: any; [k: string]: any; }

const EGG_BASE = 75; // kcal del huevo en sí, sin grasa agregada
const KCAL: Record<string, number> = {
  'cocido': 75,              // duro o pasado por agua, sin grasa
  'revuelto-sin-grasa': 80,  // sartén antiadherente, sin aceite
  'frito': 95,               // en aceite
  'revuelto': 110,           // con manteca o aceite
  'omelette': 120,           // con grasa
};

const NOMBRE: Record<string, Record<string, string>> = {
  es: { 'cocido': 'Cocido / duro', 'revuelto-sin-grasa': 'Revuelto sin grasa', 'frito': 'Frito', 'revuelto': 'Revuelto', 'omelette': 'Omelette' },
  en: { 'cocido': 'Boiled / hard-boiled', 'revuelto-sin-grasa': 'Scrambled, no fat', 'frito': 'Fried', 'revuelto': 'Scrambled', 'omelette': 'Omelette' },
  pt: { 'cocido': 'Cozido / duro', 'revuelto-sin-grasa': 'Mexido sem gordura', 'frito': 'Frito', 'revuelto': 'Mexido', 'omelette': 'Omelete' },
};

export function caloriasHuevoRevueltoFritoCocido(i: Inputs): Outputs {
  const lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const pick = (es: string, en: string, pt: string) => (lang === 'en' ? en : lang === 'pt' ? pt : es);
  const loc = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-AR';
  const fmt = (n: number) => n.toLocaleString(loc);

  let metodo = String(i.metodo || 'cocido');
  if (!(metodo in KCAL)) metodo = 'cocido';
  const kcalUnidad = KCAL[metodo];

  // El form manda '' para un número vacío; tratarlo como 1.
  const raw = i.cantidad;
  let cantidad = raw === '' || raw === null || raw === undefined ? 1 : Number(raw);
  if (!Number.isFinite(cantidad) || cantidad <= 0) cantidad = 1;
  cantidad = Math.round(cantidad);

  const total = kcalUnidad * cantidad;
  const grasaUnidad = kcalUnidad - EGG_BASE;     // kcal aportadas por la grasa de cocción, por huevo
  const grasaTotal = grasaUnidad * cantidad;
  const nombre = NOMBRE[lang][metodo] || NOMBRE.es[metodo];

  // Gráfico comparativo (barras horizontales): la escalera de métodos, de menos a más kcal.
  const chartKeys = Object.keys(KCAL).sort((a, b) => KCAL[a] - KCAL[b]);
  const chart = {
    type: 'bar' as const,
    indexAxis: 'y' as const,
    ariaLabel: pick(
      `Calorías por huevo según cocción: ${chartKeys.map((k) => `${NOMBRE.es[k]} ${KCAL[k]} kcal`).join(', ')}.`,
      `Calories per egg by method: ${chartKeys.map((k) => `${NOMBRE.en[k]} ${KCAL[k]} kcal`).join(', ')}.`,
      `Calorias por ovo por preparo: ${chartKeys.map((k) => `${NOMBRE.pt[k]} ${KCAL[k]} kcal`).join(', ')}.`,
    ),
    data: {
      labels: chartKeys.map((k) => NOMBRE[lang][k] || NOMBRE.es[k]),
      datasets: [{ label: pick('Calorías por huevo', 'Calories per egg', 'Calorias por ovo'), data: chartKeys.map((k) => KCAL[k]), suffix: ' kcal' }],
    },
  };

  const huevoW = pick(cantidad === 1 ? 'huevo' : 'huevos', cantidad === 1 ? 'egg' : 'eggs', cantidad === 1 ? 'ovo' : 'ovos');
  const resumen = pick(
    `${cantidad} ${huevoW} «${nombre.toLowerCase()}» = ${fmt(total)} kcal (${fmt(kcalUnidad)} kcal c/u).`,
    `${cantidad} «${nombre.toLowerCase()}» ${huevoW} = ${fmt(total)} kcal (${fmt(kcalUnidad)} kcal each).`,
    `${cantidad} ${huevoW} «${nombre.toLowerCase()}» = ${fmt(total)} kcal (${fmt(kcalUnidad)} kcal cada).`,
  );

  let insight: any;
  if (grasaUnidad <= 5) {
    insight = {
      title: pick('La forma más liviana', 'The lightest way', 'A forma mais leve'),
      text: pick(
        `El huevo en sí aporta unas **${EGG_BASE} kcal** y ${nombre.toLowerCase()} casi no suma grasa: por eso es de las preparaciones más livianas. ${cantidad} ${huevoW} = **${fmt(total)} kcal**. Lo que engorda no es el huevo, sino el aceite o la manteca que le agregás al cocinarlo.`,
        `The egg itself is about **${EGG_BASE} kcal**, and ${nombre.toLowerCase()} adds almost no fat — one of the lightest ways to cook it. ${cantidad} ${huevoW} = **${fmt(total)} kcal**. It's not the egg that adds up, but the oil or butter you cook it in.`,
        `O ovo em si tem cerca de **${EGG_BASE} kcal** e ${nombre.toLowerCase()} quase não soma gordura — um dos preparos mais leves. ${cantidad} ${huevoW} = **${fmt(total)} kcal**. O que pesa não é o ovo, e sim o óleo ou a manteiga do preparo.`,
      ),
      tone: 'good',
      icon: '🥚',
    };
  } else {
    insight = {
      title: pick('La grasa hace la diferencia', 'The fat makes the difference', 'A gordura faz a diferença'),
      text: pick(
        `Un huevo aporta ~**${EGG_BASE} kcal**; cocinarlo ${nombre.toLowerCase()} le suma **${fmt(grasaUnidad)} kcal** de grasa por unidad. ${cantidad} ${huevoW} = **${fmt(total)} kcal**, de las cuales **${fmt(grasaTotal)} kcal** vienen del aceite o la manteca. Hacerlo cocido (~${EGG_BASE} kcal c/u) te ahorraría esa diferencia.`,
        `An egg is ~**${EGG_BASE} kcal**; cooking it ${nombre.toLowerCase()} adds **${fmt(grasaUnidad)} kcal** of fat per egg. ${cantidad} ${huevoW} = **${fmt(total)} kcal**, of which **${fmt(grasaTotal)} kcal** come from the oil or butter. Boiling it (~${EGG_BASE} kcal each) would save that gap.`,
        `Um ovo tem ~**${EGG_BASE} kcal**; prepará-lo ${nombre.toLowerCase()} soma **${fmt(grasaUnidad)} kcal** de gordura por ovo. ${cantidad} ${huevoW} = **${fmt(total)} kcal**, das quais **${fmt(grasaTotal)} kcal** vêm do óleo ou manteiga. Cozido (~${EGG_BASE} kcal cada) pouparia essa diferença.`,
      ),
      tone: grasaUnidad >= 35 ? 'warn' : 'neutral',
      icon: '🥚',
    };
  }

  return {
    caloriasTotal: total,
    caloriasPorHuevo: kcalUnidad,
    resumen,
    _chart: chart,
    _insight: insight,
  };
}
