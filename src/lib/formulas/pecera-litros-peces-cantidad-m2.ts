export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Fish tank stocking calculator.
 *
 * Formula basis:
 *   - Tropical freshwater (slim-bodied): 1 L per 1 cm of adult body length
 *   - Tropical freshwater (heavy-bodied, e.g. cichlids, angelfish): 2 L per 1 cm
 *   - Cold-water fish (goldfish, comets): 3 L per 1 cm (high ammonia producers)
 *   - Betta (solitary, labyrinth fish): flat minimum of 15 L regardless of formula
 *
 * Sources:
 *   - INJAF (Independent Network of Responsible Aquarium Fishkeepers): https://injaf.org/articles-guides/general-guides/understanding-fish-stocking-guides/
 *   - Practical Fishkeeping UK: https://www.practicalfishkeeping.co.uk/features/frequently-asked-questions-on-stocking-densities/
 *   - Aquarium Science (David Hurd): https://aquariumscience.org/index.php/13-2-calculating-stocking-ratio/
 *   - ThinkFish UK stocking guide: https://www.thinkfish.co.uk/article/stocking-levels-for-tropical-aquarium-fish
 *
 * The formula also returns recommended surface area:
 *   - Slender fish: 30 cm² of water surface per 1 cm of fish length (pre-filter rule as a cross-check)
 *   - Heavy/cold-water fish: 50 cm² per 1 cm of fish length
 */

export function peceraLitrosPecesCantidadM2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  // Inputs
  const fishLengthCm = Math.max(0, Number(i.fishLength) || 0);   // average adult body length (cm)
  const fishCount    = Math.max(0, Math.round(Number(i.fishCount) || 0)); // number of fish
  const fishType     = String(i.fishType || 'tropical_slim');     // species group

  // Liters per cm coefficient by fish type
  const coeff: Record<string, number> = {
    tropical_slim:  1.0,  // tetras, guppies, corydoras, danios, mollies, platys
    tropical_heavy: 2.0,  // angelfish, cichlids (medium), discus
    coldwater:      3.0,  // goldfish, comets, shubunkins
    betta:          1.0,  // handled with a flat minimum below
    marine:         5.0,  // saltwater/reef fish (much stricter)
  };

  // Surface-area cm² per 1 cm of fish — historical oxygen-exchange cross-check
  const surfaceCoeff: Record<string, number> = {
    tropical_slim:  30,
    tropical_heavy: 50,
    coldwater:      50,
    betta:          30,
    marine:         60,
  };

  const k = coeff[fishType] ?? 1.0;
  const sk = surfaceCoeff[fishType] ?? 30;

  // Total adult fish length (cm)
  const totalLengthCm = fishLengthCm * fishCount;

  // Minimum volume in liters
  let minVolLiters = totalLengthCm * k;

  // Betta hard floor: 15 L for 1 fish, add 1 L/cm for each extra (bettas are solitary)
  if (fishType === 'betta') {
    const extraFish = Math.max(0, fishCount - 1);
    minVolLiters = Math.max(15, fishLengthCm * fishCount * k) + extraFish * 10;
  }

  // Round to 1 decimal
  const minVol = Math.round(minVolLiters * 10) / 10;

  // Recommended surface area in cm²
  const surfaceAreaCm2 = Math.round(totalLengthCm * sk);
  // Convert to m²
  const surfaceAreaM2 = Math.round((surfaceAreaCm2 / 10000) * 100) / 100;

  // Format result
  const minVolFmt = minVol.toFixed(1);
  const surfM2Fmt = surfaceAreaM2.toFixed(2);

  // Build human-readable result string
  const typeLabel: Record<string, Record<string, string>> = {
    tropical_slim: {
      es: 'tropical de cuerpo esbelto',
      en: 'slim-bodied tropical',
      pt: 'tropical de corpo esguio',
    },
    tropical_heavy: {
      es: 'tropical de cuerpo robusto (cíclido/disco)',
      en: 'heavy-bodied tropical (cichlid/discus)',
      pt: 'tropical de corpo robusto (ciclídeo/disco)',
    },
    coldwater: {
      es: 'agua fría (goldfish / cometa)',
      en: 'cold-water (goldfish / comet)',
      pt: 'água fria (goldfish / cometa)',
    },
    betta: {
      es: 'betta (pez luchador)',
      en: 'betta (Siamese fighting fish)',
      pt: 'betta (peixe lutador)',
    },
    marine: {
      es: 'marino / arrecife',
      en: 'marine / reef',
      pt: 'marinho / recife',
    },
  };

  const label = typeLabel[fishType]?.[__lang] ?? typeLabel['tropical_slim'][__lang];

  let resumen: string;
  if (__lang === 'en') {
    resumen = `For ${fishCount} ${label} fish averaging ${fishLengthCm} cm (adult), you need at least **${minVolFmt} L** of water. Recommended water surface area: ${surfM2Fmt} m² (${surfaceAreaCm2} cm²). Always size up by ~15 % to account for substrate and decor displacement.`;
  } else if (__lang === 'pt') {
    resumen = `Para ${fishCount} peixe(s) ${label} com comprimento médio adulto de ${fishLengthCm} cm, o volume mínimo recomendado é **${minVolFmt} L**. Área de superfície mínima de água: ${surfM2Fmt} m² (${surfaceAreaCm2} cm²). Adicione ~15 % ao volume para compensar substrato e decoração.`;
  } else {
    resumen = `Para ${fishCount} pez/peces ${label} con largo adulto promedio de ${fishLengthCm} cm, el volumen mínimo recomendado es **${minVolFmt} L**. Superficie mínima de agua: ${surfM2Fmt} m² (${surfaceAreaCm2} cm²). Sumá ~15 % extra para compensar sustrato y decoración.`;
  }

  // Resultado primary output
  const resultado = __lang === 'en'
    ? `${minVolFmt} L minimum`
    : __lang === 'pt'
    ? `${minVolFmt} L mínimo`
    : `${minVolFmt} L mínimos`;

  // Build insight
  let insightText: string;
  if (minVol === 0) {
    insightText = __lang === 'en'
      ? 'Enter the number of fish and their average adult length to get a recommendation.'
      : __lang === 'pt'
      ? 'Insira a quantidade de peixes e o comprimento adulto médio para obter uma recomendação.'
      : 'Ingresá la cantidad de peces y su largo adulto promedio para obtener una recomendación.';
  } else if (fishType === 'betta' && fishCount > 1) {
    insightText = __lang === 'en'
      ? `⚠️ Male bettas are aggressive — they should never be housed together. Consider separate tanks. Minimum for ${fishCount} bettas: **${minVolFmt} L**, but separate housing is strongly recommended.`
      : __lang === 'pt'
      ? `⚠️ Bettas machos são agressivos — nunca devem ser mantidos juntos. Considere aquários separados. Mínimo para ${fishCount} bettas: **${minVolFmt} L**, mas separação é fortemente recomendada.`
      : `⚠️ Los bettas machos son agresivos — nunca deben convivir en el mismo acuario. Considerá peceras separadas. Mínimo para ${fishCount} bettas: **${minVolFmt} L**, pero la separación es muy recomendable.`;
  } else if (fishType === 'coldwater') {
    insightText = __lang === 'en'
      ? `Cold-water fish like goldfish produce 3× more ammonia per cm than slim tropical fish. A filter rated at 5–10× tank volume/hour is essential. Minimum: **${minVolFmt} L**.`
      : __lang === 'pt'
      ? `Peixes de água fria como goldfish produzem 3× mais amônia por cm do que tropicais esguios. Um filtro dimensionado para 5–10× o volume/hora é essencial. Mínimo: **${minVolFmt} L**.`
      : `Los peces de agua fría como los goldfish producen 3× más amoniaco por cm que los tropicales esbeltos. Necesitás un filtro que mueva 5–10× el volumen por hora. Mínimo: **${minVolFmt} L**.`;
  } else if (fishType === 'marine') {
    insightText = __lang === 'en'
      ? `Marine aquariums are far more demanding. Water chemistry (salinity, pH, alkalinity) is fragile. Minimum: **${minVolFmt} L** — but 20 % extra is highly recommended for reef stability.`
      : __lang === 'pt'
      ? `Aquários marinhos são muito mais exigentes. A química da água (salinidade, pH, alcalinidade) é frágil. Mínimo: **${minVolFmt} L** — mas recomenda-se 20 % a mais para estabilidade do recife.`
      : `Los acuarios marinos son mucho más exigentes. La química del agua (salinidad, pH, alcalinidad) es frágil. Mínimo: **${minVolFmt} L** — pero se recomienda un 20 % extra para la estabilidad del arrecife.`;
  } else {
    insightText = __lang === 'en'
      ? `Good news: **${minVolFmt} L** is the minimum for your ${fishCount} fish. A well-filtered aquarium with 20–30 % weekly water changes keeps ammonia safe. Going 20 % larger gives comfortable headroom.`
      : __lang === 'pt'
      ? `**${minVolFmt} L** é o volume mínimo para seus ${fishCount} peixe(s). Um aquário bem filtrado com trocas semanais de 20–30 % mantém a amônia segura. Um tanque 20 % maior é confortável.`
      : `**${minVolFmt} L** es el volumen mínimo para tus ${fishCount} peces. Con filtro adecuado y cambios semanales del 20–30 % del agua, el amoniaco se mantiene seguro. Tener un 20 % extra de margen es lo ideal.`;
  }

  const _insight = {
    title: __lang === 'en'
      ? 'Tank size recommendation'
      : __lang === 'pt'
      ? 'Recomendação de volume do aquário'
      : 'Recomendación de volumen de pecera',
    text: insightText,
    tone: fishType === 'betta' && fishCount > 1 ? 'warning' : 'positive',
    icon: '🐠',
    chart: {
      type: 'donut',
      labels: __lang === 'en'
        ? ['Water volume (L)', 'Safety margin (+15 %)']
        : __lang === 'pt'
        ? ['Volume de água (L)', 'Margem de segurança (+15 %)']
        : ['Volumen agua (L)', 'Margen seguridad (+15 %)'],
      values: [minVol, Math.round(minVol * 0.15 * 10) / 10],
    },
  };

  return { resultado, resumen, _insight };
}
