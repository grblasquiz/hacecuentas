/**
 * Internal linking automático basado en similitud TF-IDF + cosine.
 *
 * Para cada calculadora (src/content/calcs/*.json) computa los 6 calcs más similares
 * y guarda el resultado en src/lib/related-auto.json. El [...slug].astro lo usa
 * como fallback cuando `relatedSlugs` está vacío o como complemento para llenar
 * hasta 4 cards.
 *
 * Sin dependencias externas (puro Node). Corre en build antes de astro build.
 * Tarda ~500ms para 225 calcs.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');
const OUTPUT_FILE = join(process.cwd(), 'src/lib/related-auto.json');
const TOP_K = 6;

// Stopwords españolas + términos genéricos del dominio (no discriminan entre calcs)
const STOPWORDS = new Set([
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
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
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

function main() {
  const started = Date.now();

  // Leer todas las calcs
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const calcs: Calc[] = files.map((f) => JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')));

  // Tokenizar cada una
  const tokensBySlug = new Map<string, string[]>();
  for (const c of calcs) {
    tokensBySlug.set(c.slug, tokenize(buildText(c)));
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
  const categoriesBySlug = new Map<string, string>();
  for (const c of calcs) categoriesBySlug.set(c.slug, c.category);

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
    // Ordenar: primero bump de +0.1 a los de la misma categoría, después por score.
    // Esto evita que un IMC se "enlace" con una calc de finanzas que comparte palabras genéricas.
    scores.sort((a, b) => {
      const aBoost = a.score + (a.sameCategory ? 0.1 : 0);
      const bBoost = b.score + (b.sameCategory ? 0.1 : 0);
      return bBoost - aBoost;
    });
    related[c.slug] = scores.slice(0, TOP_K).map((s) => s.slug);
  }

  // Guardar
  writeFileSync(OUTPUT_FILE, JSON.stringify(related, null, 2));

  const elapsed = Date.now() - started;
  console.log(`[related-auto] ${calcs.length} calcs → ${OUTPUT_FILE} (${elapsed}ms)`);
}

main();
