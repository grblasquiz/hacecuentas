/** Metros cuadrados de vivienda recomendados por persona.
 * Regla orientativa basada en estándares de habitabilidad residencial:
 *  - Compacto ≈ 15 m²/persona (mínimo funcional, similar a estándares de
 *    superficie útil mínima en vivienda social europea, ~14-15 m²/pers).
 *  - Cómodo ≈ 25 m²/persona (valor medio habitual en vivienda urbana).
 *  - Amplio ≈ 40 m²/persona (holgado, casas con varios ambientes).
 * El rango global se calcula con 15 m² (mínimo) y 40 m² (amplio) por persona.
 * Son cifras ORIENTATIVAS: la superficie real depende de los ambientes,
 * el diseño y la normativa local de habitabilidad.
 */
export interface Inputs {
  personas: number;
  nivel?: string;
  __lang?: string;
}
export interface Outputs {
  m2Recomendados: number;
  m2Minimo: number;
  m2Amplio: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function metrosCuadradosPorPersona(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPersonas: 'Ingresá cuántas personas viven en la casa (mínimo 1)',
      insightTitle: 'Superficie orientativa',
      perPerson: 'por persona',
      rec: 'Recomendado',
      chartAria: 'Comparación de superficie mínima, recomendada y amplia para la cantidad de personas indicada.',
    },
    en: {
      errorPersonas: 'Enter how many people live in the home (minimum 1)',
      insightTitle: 'Guideline floor area',
      perPerson: 'per person',
      rec: 'Recommended',
      chartAria: 'Comparison of minimum, recommended and spacious floor area for the given number of people.',
    },
  } as const)[__lang];

  const personas = Math.floor(Number(i.personas));
  if (!personas || personas < 1) throw new Error(T.errorPersonas);

  const niveles: Record<string, number> = { '15': 15, '25': 25, '40': 40 };
  const valorNivel = niveles[String(i.nivel)] ?? 25;

  const m2Recomendados = personas * valorNivel;
  const m2Minimo = personas * 15;
  const m2Amplio = personas * 40;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'Compact (15 m²)' : 'Compacto (15 m²)', value: m2Minimo },
      { label: __lang === 'en' ? 'Comfortable (25 m²)' : 'Cómodo (25 m²)', value: personas * 25 },
      { label: __lang === 'en' ? 'Spacious (40 m²)' : 'Amplio (40 m²)', value: m2Amplio },
    ],
    suffix: ' m²',
    centerValue: m2Recomendados.toLocaleString(locale) + ' m²',
    centerLabel: T.rec,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `For **${personas}** ${personas === 1 ? 'person' : 'people'} at **${valorNivel} m² ${T.perPerson}**, the guideline is around **${m2Recomendados} m²**. A realistic range runs from **${m2Minimo} m²** (compact) to **${m2Amplio} m²** (spacious). Ambientes, layout and local code matter more than any single number.`
      : `Para **${personas}** ${personas === 1 ? 'persona' : 'personas'} a **${valorNivel} m² ${T.perPerson}**, la referencia es de unos **${m2Recomendados} m²**. Un rango realista va de **${m2Minimo} m²** (compacto) a **${m2Amplio} m²** (amplio). Importan más los ambientes, el diseño y la normativa local que un número único.`,
    tone: 'neutral' as const,
    icon: '🏠',
  };

  return {
    m2Recomendados,
    m2Minimo,
    m2Amplio,
    formula: `${personas} ${__lang === 'en' ? 'people' : 'personas'} × ${valorNivel} m² = ${m2Recomendados} m² (${T.rec})`,
    _chart: chart,
    _insight: insight,
  };
}
