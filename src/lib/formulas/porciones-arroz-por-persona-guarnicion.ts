export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Rice portions per person — side dish
 *
 * Standard culinary consensus (ES/AR gastronomía + USDA FoodData):
 *   - Side dish: 60–80 g raw per person (default 70 g in AR/ES context)
 *   - Dry-to-cooked ratio: 1:3 by weight for long-grain white rice
 *   - Water ratio: 2 ml per 1 g of raw rice (2 cups water per 1 cup rice)
 *
 * Sources:
 *   - arrozprogreso.com / bonviveur.es — 60-80 g/persona guarnición
 *   - USDA FoodData Central — 45 g dry per ¼-cup serving (side dish)
 *   - institutoideas.com.ar — porción guarnición 50-70 g crudo
 */
export function porcionesArrozPorPersonaGuarnicion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const personas = Math.max(0, Number(i.personas) || 0);
  // gramos por persona: user-supplied or default 70 g (AR/ES standard for side dish)
  const gramosPorPersona = Math.max(1, Number(i.gramos_persona) || 70);

  // Core calculations
  const arrozCrudo = personas * gramosPorPersona;           // g raw
  const arrozCocido = arrozCrudo * 3;                       // g cooked (1:3 ratio)
  const aguaMl = arrozCrudo * 2;                            // ml water needed

  // Helpers
  const kg = (g: number) => (g / 1000).toFixed(3).replace(/\.?0+$/, '');
  const fmt = (g: number) =>
    g >= 1000
      ? `${kg(g)} kg (${g.toLocaleString('es-AR')} g)`
      : `${g.toLocaleString('es-AR')} g`;
  const fmtEn = (g: number) =>
    g >= 1000
      ? `${kg(g)} kg (${Math.round(g).toLocaleString('en-US')} g)`
      : `${Math.round(g).toLocaleString('en-US')} g`;
  const fmtWater = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L (${ml.toLocaleString('es-AR')} ml)` : `${ml.toLocaleString('es-AR')} ml`;
  const fmtWaterEn = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L (${Math.round(ml).toLocaleString('en-US')} ml)` : `${Math.round(ml).toLocaleString('en-US')} ml`;

  if (personas <= 0) {
    const empty = __lang === 'en'
      ? 'Enter the number of people to calculate the rice needed.'
      : 'Ingresá la cantidad de personas para calcular el arroz necesario.';
    return { resultado: 0, resumen: empty };
  }

  let resultado: string;
  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resultado = `${fmtEn(arrozCrudo)} dry rice`;
    resumen =
      `For **${personas} ${personas === 1 ? 'person' : 'people'}** (${gramosPorPersona} g/person side-dish portion):\n` +
      `- **Dry rice needed:** ${fmtEn(arrozCrudo)}\n` +
      `- **Cooked rice yield:** ~${fmtEn(arrozCocido)} (×3 expansion)\n` +
      `- **Water needed:** ${fmtWaterEn(aguaMl)} (2:1 water-to-rice ratio)`;
    insightText =
      `**${fmtEn(arrozCrudo)}** of dry rice feeds **${personas} ${personas === 1 ? 'person' : 'people'}** as a side dish, ` +
      `yielding ~**${fmtEn(arrozCocido)}** cooked (~${gramosPorPersona * 3} g per plate).`;
  } else {
    resultado = `${fmt(arrozCrudo)} de arroz crudo`;
    resumen =
      `Para **${personas} ${personas === 1 ? 'persona' : 'personas'}** (${gramosPorPersona} g/persona como guarnición):\n` +
      `- **Arroz crudo necesario:** ${fmt(arrozCrudo)}\n` +
      `- **Arroz cocido resultante:** ~${fmt(arrozCocido)} (factor ×3)\n` +
      `- **Agua necesaria:** ${fmtWater(aguaMl)} (relación 2:1)`;
    insightText =
      `Con **${fmt(arrozCrudo)}** de arroz crudo alimentás a **${personas} ${personas === 1 ? 'persona' : 'personas'}** como guarnición, ` +
      `obteniendo ~**${fmt(arrozCocido)}** cocido (~${gramosPorPersona * 3} g por plato).`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Rice as a side dish' : 'Arroz de guarnición',
    text: insightText,
    tone: 'neutral',
    icon: '🍚',
  };

  return { resultado, resumen, _insight };
}
