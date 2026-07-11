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
import { isRestrictedCalc } from '../src/lib/content-policy.ts';

const ROOT = process.cwd();
// Vecinos guardados por calc. Debe superar RENDER_CAP (6) para que el coverage
// pass tenga reserva fuera de la ventana renderizada (promote) y candidatos de
// desalojo sin vaciar el bloque. Antes era 6 (== cap) y AR no tenía reserva.
const TOP_K = 10;

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
  canonicalSlug?: string;
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

// País implícito de un slug. El master AR (src/content/calcs) contiene calcs
// país-específicas (peru, chile, mexico…) además de las AR-genéricas; sin esto
// el TF-IDF puede recomendar una calc de otro país como "relacionada" sólo por
// similitud de texto (ej: aguinaldo AR → CTS Perú). Todo lo que no matchea un
// marcador de país se considera 'ar' (genérico/master). Ver denoiseCountry.
const COUNTRY_RE = /(^|-)(mexico|espana|colombia|chile|peru|bolivia|ecuador|venezuela|paraguay|uruguay|dominicana|brasil|eeuu|usa)(-|$)/;
function countryOf(slug: string): string {
  const m = slug.match(COUNTRY_RE);
  return m ? m[2] : 'ar';
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

// Versión del algoritmo: bumpearla invalida el cache aunque los JSONs no
// cambien (el hash solo mira inputs — sin esto, editar este script no
// regenera los mapas ya cacheados).
const ALGO_VERSION = 'v4.3-min-inbound-3-window-insert';

// Cuántas cards renderiza RelatedCalcs (limit de CalcLayoutV2) y el mínimo de
// inlinks contextuales que garantizamos por calc DENTRO de esa ventana. El
// renderer pone primero los relatedSlugs manuales → la ventana efectiva de una
// source es RENDER_CAP - (manuales válidos).
const RENDER_CAP = 6;
const MIN_INBOUND = 3;

function hashCalcsInputs(dir: string, files: string[]): string {
  // Hash basado en el contenido raw de todos los JSONs + path (si cambia el nombre de un slug, invalida cache).
  const hash = createHash('sha1');
  hash.update(ALGO_VERSION);
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
  denoiseCountry?: boolean; // penaliza vecinos de otro país (solo master AR, donde conviven varios países).
}): void {
  const { dir, stopwords, outputFile, cacheHashFile, excludeNoindex, label, topK = TOP_K, denoiseCountry = false } = opts;
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

  // Resiliente a JSONs malformados (p.ej. otra sesión editando mid-build): skip + warn.
  let calcs: Calc[] = files.map((f) => {
    try {
      return JSON.parse(readFileSync(join(dir, f), 'utf8')) as Calc;
    } catch (e) {
      console.warn(`[related-auto:${label}] skip JSON malformado ${f}: ${(e as Error).message}`);
      return null;
    }
  }).filter((c): c is Calc => c !== null);
  // Restringidas (YMYL: dosis/tratamiento sin revisor) NUNCA se recomiendan como
  // relacionadas, en ningún locale. Las noindex se excluyen sólo donde ya se hacía
  // (EN/PT), preservando el comportamiento AR para las noindex "comunes".
  calcs = calcs.filter((c) => !isRestrictedCalc(c as any));
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
    const scores: { slug: string; score: number; sameCategory: boolean; crossCountry: boolean }[] = [];
    const myTf = tfBySlug.get(c.slug)!;
    const myCountry = denoiseCountry ? countryOf(c.slug) : 'ar';
    for (const other of calcs) {
      if (other.slug === c.slug) continue;
      const otherTf = tfBySlug.get(other.slug)!;
      const sim = cosineSimilarity(myTf, otherTf, idf);
      scores.push({
        slug: other.slug,
        score: sim,
        sameCategory: other.category === c.category,
        crossCountry: denoiseCountry && countryOf(other.slug) !== myCountry,
      });
    }
    // Ordenar: bump de +0.1 a los de la misma categoría, penalización -0.5 a los
    // de otro país (solo master AR), después por score. La penalización supera al
    // bump de categoría: una calc de otro país en la misma categoría no le gana a
    // una del mismo país en otra categoría.
    scores.sort((a, b) => {
      const aBoost = a.score + (a.sameCategory ? 0.1 : 0) - (a.crossCountry ? 0.5 : 0);
      const bBoost = b.score + (b.sameCategory ? 0.1 : 0) - (b.crossCountry ? 0.5 : 0);
      return bBoost - aBoost;
    });
    related[c.slug] = scores.slice(0, topK).map((s) => s.slug);
  }

  // Coverage pass v2: toda calc tiene que recibir ≥MIN_INBOUND links ENTRANTES
  // *que realmente se rendericen*. El renderer (RelatedCalcs) muestra primero
  // los relatedSlugs manuales de la source y completa con este mapa hasta
  // RENDER_CAP: una aparición en la lista NO garantiza render si cae fuera de
  // la ventana. Por eso acá modelamos la ventana efectiva por source y
  // garantizamos el mínimo con dos tácticas: PROMOTE (subir a ventana una
  // aparición que ya existía más abajo) e INSERT (meter al target en la lista
  // de sus vecinos más similares — cosine es simétrico). Nunca degradamos a
  // otra calc por debajo del mínimo al desalojar.
  const bySlugSet = new Set(calcs.map((c) => c.slug));
  // Solo las páginas INDEXABLES pasan equity: los links desde noindex o desde
  // alias canónicos (canonicalSlug ≠ slug) no cuentan como inbound, y solo las
  // indexables necesitan la garantía de mínimo (relevante en AR, donde el pool
  // conserva noindex; en EN/PT/verticales ya se filtran antes).
  const indexable = new Set(
    calcs
      .filter((c) => !c.noindex && !(c.canonicalSlug && c.canonicalSlug !== c.slug))
      .map((c) => c.slug),
  );
  // El renderer (RelatedCalcs) arma su pool solo con INDEXABLES: los manuales o
  // autos que apunten a noindex/alias se saltean SIN gastar ventana. Modelamos
  // igual: manualOf/renderedAuto solo consideran targets indexables.
  const manualOf = new Map<string, Set<string>>();
  for (const c of calcs) {
    manualOf.set(
      c.slug,
      new Set((c.relatedSlugs || []).filter((s) => bySlugSet.has(s) && indexable.has(s) && s !== c.slug)),
    );
  }
  const windowOf = (source: string): number =>
    Math.max(0, RENDER_CAP - Math.min(RENDER_CAP, manualOf.get(source)?.size || 0));
  // Entradas auto que renderizan para una source: las primeras `window`
  // indexables que no estén ya en sus manuales (el renderer dedupea manual→auto).
  const renderedAuto = (source: string): string[] => {
    const man = manualOf.get(source)!;
    const win = windowOf(source);
    const out: string[] = [];
    if (win <= 0) return out;
    for (const s of related[source] || []) {
      if (man.has(s) || !indexable.has(s)) continue;
      out.push(s);
      if (out.length >= win) break;
    }
    return out;
  };

  const incoming = new Map<string, number>();
  for (const c of calcs) incoming.set(c.slug, 0);
  for (const c of calcs) {
    if (!indexable.has(c.slug)) continue; // noindex/alias no pasa equity
    // Manuales: solo los primeros RENDER_CAP renderizan (el renderer corta ahí);
    // un slug manual en la posición 7+ no es un inlink real.
    let m = 0;
    for (const s of manualOf.get(c.slug)!) {
      if (m >= RENDER_CAP) break;
      incoming.set(s, (incoming.get(s) || 0) + 1);
      m++;
    }
    for (const s of renderedAuto(c.slug)) incoming.set(s, (incoming.get(s) || 0) + 1);
  }

  // ¿La entrada idx de la lista de `source` está dentro de la ventana renderizada?
  const inWindow = (source: string, idx: number): boolean => {
    const man = manualOf.get(source)!;
    const win = windowOf(source);
    let rendered = 0;
    const list = related[source] || [];
    for (let i = 0; i < list.length; i++) {
      if (man.has(list[i]) || !indexable.has(list[i])) continue;
      rendered++;
      if (i === idx) return rendered <= win;
      if (rendered >= win) return false;
    }
    return false;
  };

  const weak = calcs
    .map((c) => c.slug)
    .filter((s) => indexable.has(s) && (incoming.get(s) || 0) < MIN_INBOUND)
    .sort((a, b) => (incoming.get(a) || 0) - (incoming.get(b) || 0));
  let promoted = 0;
  let inserted = 0;
  let unresolved = 0;

  for (const target of weak) {
    let need = MIN_INBOUND - (incoming.get(target) || 0);
    if (need <= 0) continue;

    // Táctica 1 — PROMOTE: sources que ya tienen al target fuera de ventana.
    for (const source of Object.keys(related)) {
      if (need <= 0) break;
      if (source === target || !indexable.has(source)) continue;
      const list = related[source];
      const idx = list.indexOf(target);
      if (idx < 0 || inWindow(source, idx) || manualOf.get(source)!.has(target)) continue;
      const win = windowOf(source);
      if (win <= 0) continue;
      // Desalojar la última entrada renderizada si pierde de más; si la lista
      // renderizada tiene hueco (menos entradas que ventana) no hay víctima.
      const rendered = renderedAuto(source);
      const victim = rendered.length >= win ? rendered[rendered.length - 1] : null;
      if (victim && (incoming.get(victim) || 0) <= MIN_INBOUND) continue;
      list.splice(idx, 1);
      // Con ventana chica (host con varios manuales), idx 2 caería FUERA de la
      // ventana renderizada y el link no existiría: insertar al frente.
      const insertAt = win > 2 ? Math.min(2, list.length) : 0;
      list.splice(insertAt, 0, target);
      if (victim) incoming.set(victim, (incoming.get(victim) || 1) - 1);
      incoming.set(target, (incoming.get(target) || 0) + 1);
      need--;
      promoted++;
    }

    // Táctica 2 — INSERT: meter al target en la lista de sus vecinos más
    // similares (su propia lista related[target], simetría del cosine).
    for (const host of related[target] || []) {
      if (need <= 0) break;
      if (!indexable.has(host)) continue;
      const hostList = related[host];
      if (!hostList || hostList.includes(target) || manualOf.get(host)?.has(target)) continue;
      const win = windowOf(host);
      if (win <= 0) continue;
      const rendered = renderedAuto(host);
      const victim = rendered.length >= win ? rendered[rendered.length - 1] : null;
      if (victim && (incoming.get(victim) || 0) <= MIN_INBOUND) continue;
      if (victim) {
        const vIdx = hostList.indexOf(victim);
        if (vIdx >= 0) hostList.splice(vIdx, 1);
        incoming.set(victim, (incoming.get(victim) || 1) - 1);
      }
      hostList.splice(win > 2 ? Math.min(2, hostList.length) : 0, 0, target);
      incoming.set(target, (incoming.get(target) || 0) + 1);
      need--;
      inserted++;
    }

    if (need > 0) unresolved++;
  }

  const stillOrphan = calcs.filter((c) => indexable.has(c.slug) && (incoming.get(c.slug) || 0) === 0);
  for (const o of stillOrphan) console.warn(`[related-auto:${label}] huérfana sin host viable: ${o.slug}`);
  if (weak.length > 0) {
    console.log(
      `[related-auto:${label}] coverage v2: ${weak.length} calcs con <${MIN_INBOUND} inlinks → ${promoted} promotes + ${inserted} inserts, ${unresolved} sin resolver del todo, ${stillOrphan.length} huérfanas`,
    );
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
    denoiseCountry: true, // el master AR mezcla calcs de varios países
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
  // Verticales país (2026-06-10): hasta hoy las 361 calcs CO/MX/CL/PE/EC NO
  // tenían grafo TF-IDF propio — RelatedCalcs caía al fallback por categoría
  // y a veces mostraba calcs ARGENTINAS (módulo es). Un mapa por país
  // (stopwords ES, son todas español) acelera la indexación Bing del headroom
  // vertical: más in-links internos contextuales = se rankea antes. topK=12
  // para densificar el grafo (mismo motivo que EN: evitar crawl starvation).
  // 2026-06-23: + es/ve/py/uy/do. España (calcs-es) y las 4 verticales nuevas
  // NO tenían grafo TF-IDF → RelatedCalcs caía a fallback por categoría o (es-ES)
  // a mapa vacío, renderizando 0 enlaces internos a su propio cluster (verificado
  // en vivo: convenio-hosteleria-es mostraba 0 /es/ links vs 11 del CO equivalente).
  // Huérfanos internamente = peor indexación/autoridad justo en el cuello de España.
  for (const v of ['co', 'mx', 'cl', 'pe', 'ec', 'es', 've', 'py', 'uy', 'do']) {
    computeRelated({
      dir: join(ROOT, `src/content/calcs-${v}`),
      stopwords: STOPWORDS_ES,
      outputFile: join(ROOT, `src/lib/related-auto-${v}.json`),
      cacheHashFile: join(ROOT, `src/lib/related-auto-${v}.hash`),
      excludeNoindex: true,
      label: v,
      topK: 12,
    });
  }
  // Portugal (/pt-pt/) — vertical aparte del loop ES porque es PORTUGUÉS:
  // usa STOPWORDS_PT (no las ES), igual que Brasil (calcs-pt). Sin esto los
  // calcs PT quedan huérfanos del grafo interno (mismo bug que tenía España).
  computeRelated({
    dir: join(ROOT, 'src/content/calcs-pt-pt'),
    stopwords: STOPWORDS_PT,
    outputFile: join(ROOT, 'src/lib/related-auto-pt-pt.json'),
    cacheHashFile: join(ROOT, 'src/lib/related-auto-pt-pt.hash'),
    excludeNoindex: true,
    label: 'pt-pt',
    topK: 12,
  });
}

main();
