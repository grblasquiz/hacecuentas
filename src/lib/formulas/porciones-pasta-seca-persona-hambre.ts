export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Dry pasta portions per person calculator.
 *
 * Reference portions (pasta seca / dry, uncooked):
 *   entrada / side dish : 60 g  (2.1 oz)
 *   normal              : 80 g  (2.8 oz)
 *   moderado / light main: 100 g (3.5 oz)
 *   intenso / hearty main: 120 g (4.2 oz)
 *   deportista / athlete : 150 g (5.3 oz)
 *
 * Cooking factor: dry × 2.3 ≈ cooked weight (average for semolina pasta)
 * Calories: ~350 kcal / 100 g dry (USDA FoodData Central #168936; INTA tablas 2024)
 * Children (≤12 y): half adult portion = 40 g / 1.4 oz
 */
export function porcionesPastaSecaPersonaHambre(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const personas  = Math.max(0, Number(i.personas)  || 0);
  const ninos     = Math.max(0, Number(i.ninos)      || 0);
  const perfil    = String(i.perfil || 'normal').trim();

  // Grams per adult per profile
  const porcionAdultoG: Record<string, number> = {
    entrada:    60,
    normal:     80,
    moderado:  100,
    intenso:   120,
    deportista:150,
  };
  const porcionAdultoOz: Record<string, number> = {
    entrada:    2.1,
    normal:     2.8,
    moderado:   3.5,
    intenso:    4.2,
    deportista: 5.3,
  };

  const gAdulto  = porcionAdultoG[perfil]  ?? 80;
  const ozAdulto = porcionAdultoOz[perfil] ?? 2.8;
  const gNino    = 40; // children ≤12: ~40 g dry
  const ozNino   = 1.4;

  const adultos = Math.max(0, personas - ninos);
  const totalG  = adultos * gAdulto + ninos * gNino;
  const totalOz = adultos * ozAdulto + ninos * ozNino;

  const cocidoG   = Math.round(totalG * 2.3);
  const kcal      = Math.round(totalG * 3.5); // 350 kcal / 100g → 3.5 kcal/g

  const paquetes500   = Math.ceil(totalG / 500);
  const cajas454g     = Math.ceil(totalG / 454); // 1 lb box

  // Profile label
  const perfilLabel: Record<string, { es: string; en: string }> = {
    entrada:    { es: 'entrada / dieta',       en: 'side dish / diet' },
    normal:     { es: 'plato principal normal', en: 'regular main course' },
    moderado:   { es: 'hambre moderada',        en: 'moderately hungry' },
    intenso:    { es: 'hambre intensa',         en: 'very hungry' },
    deportista: { es: 'deportista / volumen',   en: 'athlete / bulking' },
  };
  const pLabel = perfilLabel[perfil] ?? perfilLabel['normal'];

  if (personas === 0) {
    const placeholder = __lang === 'en' ? 'Enter number of people to get a result' : 'Ingresá la cantidad de personas para obtener el resultado';
    return { resultado: '', resumen: placeholder, _insight: { title: '', text: placeholder, tone: 'neutral', icon: '🍝' } };
  }

  // Format resultado as "XXX g / X.X oz"
  const resultado = __lang === 'en'
    ? `${Math.round(totalG)} g (${totalOz.toFixed(1)} oz) dry pasta`
    : `${Math.round(totalG)} g de pasta seca`;

  // Resumen
  let resumen: string;
  if (__lang === 'en') {
    resumen = `For ${personas} ${personas === 1 ? 'person' : 'people'} (${pLabel.en}): **${Math.round(totalG)} g / ${totalOz.toFixed(1)} oz** dry pasta → cooked weight ≈ **${cocidoG} g** · ~**${kcal} kcal** · needs **${cajas454g}** 1 lb box${cajas454g !== 1 ? 'es' : ''}.`;
  } else {
    resumen = `Para ${personas} ${personas === 1 ? 'persona' : 'personas'} (${pLabel.es}): **${Math.round(totalG)} g** de pasta seca → cocida ≈ **${cocidoG} g** · ~**${kcal} kcal** · necesitás **${paquetes500}** paquete${paquetes500 !== 1 ? 's' : ''} de 500 g.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Total dry pasta needed' : 'Pasta seca total necesaria',
    text: __lang === 'en'
      ? `**${Math.round(totalG)} g (${totalOz.toFixed(1)} oz)** dry for **${personas} ${personas === 1 ? 'person' : 'people'}** — yields ≈ **${cocidoG} g** cooked (2.3× factor). Approx. **${kcal} kcal** total (sauce not included).`
      : `**${Math.round(totalG)} g** secos para **${personas} ${personas === 1 ? 'persona' : 'personas'}** — rinde ≈ **${cocidoG} g** cocidos (factor 2,3×). Aproximadamente **${kcal} kcal** en total (sin salsa).`,
    tone: 'positive',
    icon: '🍝',
  };

  return { resultado, resumen, _insight };
}
