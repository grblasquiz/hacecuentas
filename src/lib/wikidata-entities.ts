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
  // ── Expansion 2026-05-12 (Q IDs verificados con wikidata.org/wiki/QXXX) ──
  // Universal concepts
  {
    qid: 'Q11229',
    name: 'Porcentaje',
    patterns: [/\bporcentaje\b/i, /\bpercentage\b/i, /regla de tres/i],
  },
  {
    qid: 'Q11570',
    name: 'Kilogramo',
    patterns: [/\bkilogramos?\b/i, /\bkilograms?\b/i, /\bkg\b/i],
  },
  {
    qid: 'Q25267',
    name: 'Grado Celsius',
    patterns: [/celsius/i, /grado.*centígrado/i, /\bºc\b/i],
  },
  {
    qid: 'Q123148',
    name: 'Decibelio',
    patterns: [/\bdecibelios?\b/i, /\bdecibel(s|es)?\b/i, /\bdb\b/i],
  },
  {
    qid: 'Q1062498',
    name: 'Kilovatio-hora',
    patterns: [/\bkwh\b/i, /kilovatio.hora/i, /kilowatt.hour/i],
  },
  // Tiempo / calendario
  {
    qid: 'Q19809',
    name: 'Navidad',
    patterns: [/\bnavidad\b/i, /\bchristmas\b/i, /\bnatal\b/i],
  },
  {
    qid: 'Q4856414',
    name: 'Aniversario',
    patterns: [/aniversario.*pareja/i, /aniversario.*boda/i, /wedding anniversary/i],
  },
  // Finanzas
  {
    qid: 'Q1227997',
    name: 'Préstamo',
    patterns: [/cuota.*préstamo/i, /cuota.*prestamo/i, /\bloan\b/i, /préstamo personal/i],
  },
  {
    qid: 'Q2249676',
    name: 'Depósito a plazo fijo',
    patterns: [/plazo fijo/i, /fixed deposit/i, /\bcdb\b/i],
  },
  {
    qid: 'Q179322',
    name: 'Interés compuesto',
    patterns: [/interés compuesto/i, /interes compuesto/i, /compound interest/i],
  },
  {
    qid: 'Q5360226',
    name: 'Movimiento FIRE',
    patterns: [/\bfire\b.*retiro/i, /retiro temprano/i, /financial independence/i],
  },
  {
    qid: 'Q170658',
    name: 'Fondo común de inversión',
    patterns: [/\bfci\b/i, /fondo común de inversión/i, /money market/i],
  },
  // Comida / cultura
  {
    qid: 'Q1190554',
    name: 'Propina',
    patterns: [/\bpropina\b/i, /\btip\b.*restaurant/i, /\bgratuit(y|ie)\b/i],
  },
  {
    qid: 'Q935843',
    name: 'Empanada',
    patterns: [/\bempanadas?\b/i],
  },
  {
    qid: 'Q2872105',
    name: 'Asado',
    patterns: [/\basado\b/i, /\bparrillada\b/i, /chorizos?.*invitado/i],
  },
  // Tech / media
  {
    qid: 'Q5466811',
    name: 'Twitch',
    patterns: [/\btwitch\b/i, /\bbits\b.*don/i],
  },
  {
    qid: 'Q186975',
    name: 'Stop motion',
    patterns: [/stop.motion/i],
  },
  // Fútbol / deportes
  {
    qid: 'Q19317',
    name: 'Copa Mundial de Fútbol de 2026',
    patterns: [/mundial 2026/i, /world cup 2026/i, /fifa 2026/i, /copa mundial.*2026/i],
  },
  {
    qid: 'Q17313',
    name: 'Copa Mundial de Fútbol',
    patterns: [/copa mundial.*fifa/i, /\bfifa world cup\b/i, /fifa world championship/i],
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

/**
 * Returns the primary Wikidata entity that the calc is ABOUT (vs just mentions).
 * Heurística: prioriza match en H1 sobre seoKeywords. Si hay match en H1, ese
 * es el `about` (primary topic). Si no hay match en H1 pero sí en keywords,
 * devuelve null (mejor no inyectar about que inyectarlo erróneo).
 *
 * Schema.org distingue:
 *   - `about`: el primary topic de la página (más fuerte para Google/Bing/LLMs)
 *   - `mentions`: entidades secundarias mencionadas
 */
export function findPrimaryAbout(h1: string): { '@type': 'Thing'; name: string; sameAs: string } | null {
  if (!h1 || typeof h1 !== 'string') return null;
  for (const ent of WIKIDATA_ENTITIES) {
    for (const pat of ent.patterns) {
      if (pat.test(h1)) {
        return {
          '@type': 'Thing',
          name: ent.name,
          sameAs: `https://www.wikidata.org/wiki/${ent.qid}`,
        };
      }
    }
  }
  return null;
}
