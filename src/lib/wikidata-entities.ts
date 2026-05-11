/**
 * Mapping de entidades clave → Wikidata Q IDs.
 *
 * Usado en JSON-LD `mentions` field de cada calc — le da a LLMs
 * (ChatGPT/Claude/Perplexity/Gemini) entity disambiguation gratis
 * y los conecta con el knowledge graph de Wikidata.
 *
 * Q IDs verificados via wikidata.org/w/api.php (2026-05-11).
 * Si un keyword matchea el texto de una calc (h1 o seoKeywords),
 * agregamos el Wikidata URL a mentions.
 */

export type WikidataEntity = {
  /** Q ID de Wikidata */
  qid: string;
  /** Nombre canónico para el schema name field */
  name: string;
  /** Patterns que detectan la entidad en h1/seoKeywords/title */
  patterns: RegExp[];
};

export const WIKIDATA_ENTITIES: WikidataEntity[] = [
  // Argentina-specific
  {
    qid: 'Q830348',
    name: 'ANSES',
    patterns: [/\banses\b/i, /administración nacional.*seguridad social/i],
  },
  {
    qid: 'Q830277',
    name: 'AFIP',
    patterns: [/\bafip\b/i, /\barca\b/i, /administración federal.*ingresos públicos/i],
  },
  {
    qid: 'Q642444',
    name: 'Banco Central de la República Argentina',
    patterns: [/\bbcra\b/i, /banco central.*argentina/i],
  },
  {
    qid: 'Q97273582',
    name: 'Monotributo',
    patterns: [/\bmonotributo\b/i, /monotributista/i],
  },
  {
    qid: 'Q9015013',
    name: 'Unidad de Valor Adquisitivo',
    patterns: [/\buva\b/i, /unidad de valor adquisitivo/i],
  },
  // Salud / Body
  {
    qid: 'Q131191',
    name: 'Body mass index',
    patterns: [/\bimc\b/i, /índice de masa corporal/i, /\bbmi\b/i],
  },
  {
    qid: 'Q39861',
    name: 'Embarazo',
    patterns: [/\bembarazo\b/i, /gestación/i, /\bpregnancy\b/i],
  },
  {
    qid: 'Q187930',
    name: 'Ovulación',
    patterns: [/\bovulación\b/i, /ciclo menstrual/i],
  },
  // Economía
  {
    qid: 'Q35563',
    name: 'Inflación',
    patterns: [/\binflación\b/i, /\binflacion\b/i],
  },
  {
    qid: 'Q1110404',
    name: 'Índice de Precios al Consumidor',
    patterns: [/\bipc\b/i, /índice de precios al consumidor/i],
  },
  {
    qid: 'Q866940',
    name: 'Salario mínimo',
    patterns: [/salario mínimo/i, /sueldo mínimo/i, /smvm/i, /minimum wage/i],
  },
  {
    qid: 'Q1093',
    name: 'Jubilación',
    patterns: [/\bjubilación\b/i, /\bjubilacion\b/i, /retiro previsional/i, /haber jubilatorio/i],
  },
  {
    qid: 'Q170416',
    name: 'Impuesto al valor agregado',
    patterns: [/\biva\b/i, /impuesto al valor agregado/i],
  },
  {
    qid: 'Q179222',
    name: 'Impuesto sobre la renta',
    patterns: [/impuesto a las ganancias/i, /\bganancias\b.*sueldo/i, /retención.*ganancias/i],
  },
  {
    qid: 'Q806486',
    name: 'Indemnización por despido',
    patterns: [/indemnización.*despido/i, /despido sin causa/i],
  },
  // Misc
  {
    qid: 'Q189390',
    name: 'Sueldo Anual Complementario',
    patterns: [/aguinaldo/i, /\bsac\b/i, /sueldo anual complementario/i],
  },
];

/**
 * Returns Wikidata Q ID URLs for entities mentioned in the given text.
 * Used to populate JSON-LD `mentions` field per calc.
 */
export function findMentions(text: string): Array<{ '@type': 'Thing'; name: string; sameAs: string }> {
  if (!text || typeof text !== 'string') return [];
  const found = new Set<string>();
  const mentions: Array<{ '@type': 'Thing'; name: string; sameAs: string }> = [];
  for (const ent of WIKIDATA_ENTITIES) {
    if (found.has(ent.qid)) continue;
    for (const pat of ent.patterns) {
      if (pat.test(text)) {
        mentions.push({
          '@type': 'Thing',
          name: ent.name,
          sameAs: `https://www.wikidata.org/wiki/${ent.qid}`,
        });
        found.add(ent.qid);
        break;
      }
    }
  }
  return mentions;
}
