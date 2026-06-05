/**
 * Internal linking automático basado en similitud TF-IDF + cosine.
 *
 * Para cada calculadora computa los 6 calcs más similares y guarda el resultado
 * en src/lib/related-auto*.json. El [...slug].astro lo usa como fallback cuando
 * `relatedSlugs` está vacío o como complemento para llenar hasta 4 cards.
 *
 * Multi-locale (2026-05-29): además del ES (root), genera mapas para EN y PT
 * con stopwords propias de cada idioma. Sin esto las calcs EN/PT no tenían
 * internal linking TF-IDF — caían al fallback por categoría (menos relevante)
 * y nunca mostraban el bloque contextual "You may also find useful".
 *   - ES → src/lib/related-auto.json        (calcs/)
 *   - EN → src/lib/related-auto-en.json      (calcs-en/, solo indexables)
 *   - PT → src/lib/related-auto-pt.json      (calcs-pt/, solo indexables)
 *
 * EN/PT excluyen calcs `noindex` del pool de candidatos: linkear a una página
 * noindex desperdicia un slot de internal linking (Google no la va a indexar).
 *
 * Sin dependencias externas (puro Node). Corre en build antes de astro build.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const TOP_K = 6;

// Stopwords españolas + términos genéricos del dominio (no discriminan entre calcs)
const STOPWORDS_ES = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'las', 'un', 'por', 'con', 'no', 'una',
  'su', 'para', 'es', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'este',
  'si', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'tambien', 'me',
  'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos',
  'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto',
  'mi', 'antes', 'algunos', 'que', 'unos', 'yo', 'otro', 'otras', 'otra', 'el', 'tanto',
  'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar',
  'estas', 'algunas', 'algo', 'nosotros', 'vos', 'ustedes', 'ti', 'nos',
  // Términos del dominio que aparecen en casi todos:
  'calculadora', 'calcular', 'calculo', 'calcula', 'segun', 'tu', 'te',
  'podes', 'puede', 'ser', 'esta', 'esto', 'esa', 'estos', 'tenes',
  // Artículos / conectores adicionales
  'al', 'del', 'ha', 'han', 'fue', 'son', 'era', 'hace', 'tiene', 'tener',
  'va', 'vas', 'hace', 'hago', 'voy', 'vamos',
]);

// Stopwords inglesas + términos genéricos del dominio.
const STOPWORDS_EN = new Set([
  'the', 'of', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with',
  'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'an', 'can',
  'how', 'what', 'when', 'which', 'will', 'so', 'if', 'do', 'does', 'has', 'have', 'had',
  'but', 'they', 'we', 'their', 'them', 'these', 'those', 'than', 'then', 'into', 'out',
  'up', 'down', 'about', 'over', 'use', 'using', 'get', 'one', 'two', 'more', 'most',
  'each', 'per', 'its', 'i', 'my', 'me', 'our', 'us', 'he', 'she', 'his', 'her',
  // Términos del dominio
  'calculator', 'calculate', 'calc', 'compute', 'estimate', 'tool', 'online', 'free',
]);

// Stopwords portuguesas + términos genéricos del dominio.
const STOPWORDS_PT = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'e', 'com', 'nao', 'uma',
  'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das',
  'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'ja', 'eu', 'tambem', 'so', 'pelo', 'pela',
  'ate', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos', 'seus', 'quem', 'nas',
  'me', 'esse', 'eles', 'voce', 'essa', 'num', 'nem', 'suas', 'meu', 'minha', 'numa',
  'pelos', 'elas', 'qual', 'sao', 'foi', 'ser', 'tem', 'ter', 'esta', 'este', 'estes',
  // Términos del dominio
  'calculadora', 'calcular', 'calculo', 'calcula', 'estimar', 'ferramenta', 'online', 'gratis',
]);

interface Calc {
  slug: string;
  title: string;
  description: string;
  category: string;
  intro?: string;
  keyTakeaway?: string;
  explanation?: string;
  seoKeywords?: string[];
  relatedSlugs?: string[];
  noindex?: boolean;
}

function tokenize(text: string, stopwords: Set<string>): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopwords.has(w));
}

function buildText(calc: Calc): string {
  // Priorizamos los campos más discriminativos: title, description, keyTakeaway, seoKeywords.
  // Pesamos título doble (repetido) y seoKeywords triple (repetidos) para que dominen el signal.
  const parts: string[] = [
    calc.title,
    calc.title, // peso doble
    calc.description,
    calc.keyTakeaway || '',
    calc.intro || '',
    ...(calc.seoKeywords || []),
    ...(calc.seoKeywords || []),
    ...(calc.seoKeywords || []),
    calc.category,
    calc.category, // peso doble
    (calc.explanation || '').slice(0, 1500),
  ];
  return parts.join(' ');
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }
  // Normalizar por total de tokens
  const total = tokens.length || 1;
  for (const [k, v] of tf) tf.set(k, v / total);
  return tf;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
  idf: Map<string, number>
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const allKeys = new Set<string>([...a.keys(), ...b.keys()]);
  for (const k of allKeys) {
    const idfK = idf.get(k) || 0;
    const av = (a.get(k) || 0) * idfK;
    const bv = (b.get(k) || 0) * idfK;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function hashCalcsInputs(dir: string, files: string[]): string {
  // Hash basado en el contenido raw de todos los JSONs + path (si cambia el nombre de un slug, invalida cache).
  const hash = createHash('sha1');
  for (const f of files.sort()) {
    hash.update(f);
    hash.update(readFileSync(join(dir, f), 'utf8'));
  }
  return hash.digest('hex');
}

/**
 * Computa el mapa de related para un directorio de calcs y lo escribe a outputFile.
 * @param excludeNoindex si true, las calcs noindex no entran (ni como source ni
 *   como candidato). Útil para EN/PT donde ~30-46% son noindex.
 */
function computeRelated(opts: {
  dir: string;
  stopwords: Set<string>;
  outputFile: string;
  cacheHashFile: string;
  excludeNoindex: boolean;
  label: string;
  topK?: number; // vecinos a guardar. Default 6; EN usa 12 para densificar el grafo de crawl interno.
}): void {
  const { dir, stopwords, outputFile, cacheHashFile, excludeNoindex, label, topK = TOP_K } = opts;
  const started = Date.now();

  if (!existsSync(dir)) {
    console.log(`[related-auto:${label}] dir no existe (${dir}) — skip`);
    return;
  }

  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  // Cache check: si el hash de los inputs no cambió y el output existe, skip.
  const inputHash = hashCalcsInputs(dir, files);
  if (existsSync(cacheHashFile) && existsSync(outputFile)) {
    const cachedHash = readFileSync(cacheHashFile, 'utf8').trim();
    if (cachedHash === inputHash) {
      console.log(`[related-auto:${label}] cache HIT (${inputHash.slice(0, 10)}) — skip in ${Date.now() - started}ms`);
      return;
    }
  }

  let calcs: Calc[] = files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
  if (excludeNoindex) calcs = calcs.filter((c) => !c.noindex);

  // Tokenizar cada una
  const tokensBySlug = new Map<string, string[]>();
  for (const c of calcs) {
    tokensBySlug.set(c.slug, tokenize(buildText(c), stopwords));
  }

  // Calcular IDF: log(N / df(t))
  const N = calcs.length;
  const documentFreq = new Map<string, number>();
  for (const tokens of tokensBySlug.values()) {
    const unique = new Set(tokens);
    for (const t of unique) {
      documentFreq.set(t, (documentFreq.get(t) || 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [t, df] of documentFreq) {
    idf.set(t, Math.log(N / df));
  }

  // Calcular TF por slug
  const tfBySlug = new Map<string, Map<string, number>>();
  for (const [slug, tokens] of tokensBySlug) {
    tfBySlug.set(slug, termFrequency(tokens));
  }

  // Para cada calc, encontrar los top-K más similares
  const related: Record<string, string[]> = {};
  for (const c of calcs) {
    const scores: { slug: string; score: number; sameCategory: boolean }[] = [];
    const myTf = tfBySlug.get(c.slug)!;
    for (const other of calcs) {
      if (other.slug === c.slug) continue;
      const otherTf = tfBySlug.get(other.slug)!;
      const sim = cosineSimilarity(myTf, otherTf, idf);
      scores.push({
        slug: other.slug,
        score: sim,
        sameCategory: other.category === c.category,
      });
    }
    // Ordenar: bump de +0.1 a los de la misma categoría, después por score.
    scores.sort((a, b) => {
      const aBoost = a.score + (a.sameCategory ? 0.1 : 0);
      const bBoost = b.score + (b.sameCategory ? 0.1 : 0);
      return bBoost - aBoost;
    });
    related[c.slug] = scores.slice(0, topK).map((s) => s.slug);
  }

  writeFileSync(outputFile, JSON.stringify(related, null, 2));
  writeFileSync(cacheHashFile, inputHash);
  console.log(`[related-auto:${label}] ${calcs.length} calcs → ${outputFile} (${Date.now() - started}ms, cache MISS — ${inputHash.slice(0, 10)})`);
}

function main() {
  // ES (root) — comportamiento original, todas las calcs.
  computeRelated({
    dir: join(ROOT, 'src/content/calcs'),
    stopwords: STOPWORDS_ES,
    outputFile: join(ROOT, 'src/lib/related-auto.json'),
    cacheHashFile: join(ROOT, 'src/lib/related-auto.hash'),
    excludeNoindex: false,
    label: 'es',
  });
  // EN — solo indexables (46% son noindex; no malgastar slots de link).
  computeRelated({
    dir: join(ROOT, 'src/content/calcs-en'),
    stopwords: STOPWORDS_EN,
    outputFile: join(ROOT, 'src/lib/related-auto-en.json'),
    cacheHashFile: join(ROOT, 'src/lib/related-auto-en.hash'),
    excludeNoindex: true,
    label: 'en',
    topK: 12, // densificar grafo de crawl interno EN (crawl starvation: solo 24% crawleadas por Bing)
  });
  // PT — solo indexables.
  computeRelated({
    dir: join(ROOT, 'src/content/calcs-pt'),
    stopwords: STOPWORDS_PT,
    outputFile: join(ROOT, 'src/lib/related-auto-pt.json'),
    cacheHashFile: join(ROOT, 'src/lib/related-auto-pt.hash'),
    excludeNoindex: true,
    label: 'pt',
  });
}

main();
