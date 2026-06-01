/**
 * Backfill de FAQs faltantes con Claude API.
 *
 * Muchas calcs tienen <7 FAQs (la regla de producto pide mínimo 7 para SEO).
 * Este script genera las que faltan usando Opus 4.7 con el contexto de cada
 * calc (intro, explanation, useCases + FAQs existentes como few-shot de tono).
 *
 * Modos:
 *   --sample [N=3]   Genera N calcs de muestra, imprime a stdout. NO escribe.
 *                    Uso: inspección de calidad antes del batch completo.
 *   --batch          Batch API (50% off) para TODAS las calcs con <7 FAQs.
 *                    Escribe JSONs actualizados + snapshot de estado.
 *
 * Requisitos: ANTHROPIC_API_KEY en env.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CALCS_DIR = join(ROOT, 'src/content/calcs');
const STATE_DIR = join(ROOT, 'scripts/.backfill-faqs');
const MODEL = 'claude-opus-4-7';
const FAQ_MIN = 7;

interface FaqItem { q: string; a: string; }

interface Calc {
  slug: string;
  h1: string;
  description: string;
  intro?: string;
  keyTakeaway?: string;
  explanation?: string;
  useCases?: string[];
  seoKeywords?: string[];
  faq?: FaqItem[];
  [k: string]: unknown;
}

function listLowFaqCalcs(): Array<{ file: string; calc: Calc; missing: number }> {
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const out: Array<{ file: string; calc: Calc; missing: number }> = [];
  for (const f of files) {
    const calc = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')) as Calc;
    const n = calc.faq?.length ?? 0;
    if (n < FAQ_MIN) out.push({ file: f, calc, missing: FAQ_MIN - n });
  }
  return out.sort((a, b) => b.missing - a.missing);
}

// System prompt estable (cacheable). Todo lo variable va en user message.
const SYSTEM_PROMPT = `Sos un editor SEO experto en generar FAQs para un sitio de calculadoras en español (hacecuentas.com). El sitio cubre finanzas argentinas, salud, deportes, cripto, cocina, construcción y más.

REGLAS DE ESTILO (críticas):
1. Tono directo, informal argentino (usar "vos" / "tenés" si aplica, pero sin forzarlo). Sin jerga excesiva.
2. Respuestas específicas y técnicas con números, nombres propios, fórmulas concretas. NUNCA respuestas vagas tipo "depende del caso" o "consultá un profesional".
3. Cada respuesta debe aportar info NO trivial que alguien googleando querría saber. Si la respuesta es obvia por el título de la calc, NO la incluyas.
4. Markdown permitido: **negrita** para resaltar términos técnicos. NO headings. NO listas (a menos que sean imprescindibles).
5. Largo típico de una respuesta: 2-5 oraciones (200-400 chars). No novelas.
6. No repetir info de las FAQs existentes que te paso — complementarlas con ángulos distintos.

ÁNGULOS posibles (elegí los más relevantes según la calc):
- Diferencias con alternativas similares (ej: "¿Aave vs Compound?")
- Casos borde / cuándo NO aplica la fórmula
- Contexto argentino específico (inflación, tasas, normativa local) si la calc lo amerita
- Tips para interpretar resultados
- Errores comunes al calcular
- Aspectos técnicos/científicos detrás de la fórmula

FORMATO: devolvé SOLO un array JSON de objetos {"q": "...", "a": "..."}. Sin preámbulo, sin explicación, sin markdown fences. El JSON debe ser parseable directamente.`;

function buildUserPrompt(calc: Calc, missing: number): string {
  const parts: string[] = [];
  parts.push(`CALCULADORA: ${calc.h1}\n`);
  parts.push(`Descripción: ${calc.description}\n`);
  if (calc.intro) parts.push(`Intro: ${calc.intro}\n`);
  if (calc.keyTakeaway) parts.push(`Key takeaway: ${calc.keyTakeaway}\n`);
  if (calc.explanation) parts.push(`Fórmula/explicación:\n${calc.explanation}\n`);
  if (calc.useCases?.length) parts.push(`Casos de uso:\n${calc.useCases.map((u) => `- ${u}`).join('\n')}\n`);
  if (calc.seoKeywords?.length) parts.push(`Keywords SEO objetivo: ${calc.seoKeywords.join(', ')}\n`);
  if (calc.faq?.length) {
    parts.push(`FAQs YA EXISTENTES (NO las repitas, usalas de referencia de estilo):`);
    for (let i = 0; i < calc.faq.length; i++) {
      parts.push(`\n[${i + 1}] Q: ${calc.faq[i].q}\n    A: ${calc.faq[i].a}`);
    }
    parts.push('\n');
  }
  parts.push(`\nGenerá EXACTAMENTE ${missing} FAQs nuevas que complementen las existentes. Respetá las reglas de estilo. Devolvé solo el array JSON.`);
  return parts.join('\n');
}

const FAQ_SCHEMA = {
  type: 'object',
  properties: {
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          a: { type: 'string' },
        },
        required: ['q', 'a'],
        additionalProperties: false,
      },
    },
  },
  required: ['faqs'],
  additionalProperties: false,
} as const;

function parseFaqs(text: string): FaqItem[] {
  // El model devuelve {faqs: [...]} o array directo. Probamos ambos.
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  if (parsed.faqs && Array.isArray(parsed.faqs)) return parsed.faqs;
  throw new Error(`Respuesta inesperada: ${cleaned.slice(0, 200)}`);
}

// ─── Modo SAMPLE (API directa, sin batch) ────────────────────────────────────

async function runSample(n: number) {
  const client = new Anthropic();
  const targets = listLowFaqCalcs().slice(0, n);
  console.log(`[sample] ${targets.length} calcs, modelo ${MODEL}, sin batch.\n`);

  for (const { file, calc, missing } of targets) {
    console.log(`━━━ ${calc.slug} (faltan ${missing}) ━━━`);
    const t0 = Date.now();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(calc, missing) }],
      output_config: {
        format: { type: 'json_schema', schema: FAQ_SCHEMA },
      },
    });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const faqs = parseFaqs(text);
    console.log(`(${secs}s · in=${response.usage.input_tokens} out=${response.usage.output_tokens} cache_r=${response.usage.cache_read_input_tokens ?? 0})\n`);
    for (let i = 0; i < faqs.length; i++) {
      console.log(`  [${i + 1}] Q: ${faqs[i].q}`);
      console.log(`      A: ${faqs[i].a}\n`);
    }
  }
  console.log(`[sample] ✓ listo. Revisá calidad antes de correr --batch.`);
}

// ─── Modo BATCH (Batches API, 50% off) ───────────────────────────────────────

async function runBatch() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });

  const client = new Anthropic();
  const targets = listLowFaqCalcs();
  console.log(`[batch] ${targets.length} calcs a procesar. Creando batch…\n`);

  const requests = targets.map(({ file, calc, missing }) => ({
    custom_id: file.replace(/\.json$/, ''),
    params: {
      model: MODEL,
      max_tokens: 4000,
      system: [
        { type: 'text' as const, text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' as const } },
      ],
      messages: [{ role: 'user' as const, content: buildUserPrompt(calc, missing) }],
      output_config: {
        format: { type: 'json_schema' as const, schema: FAQ_SCHEMA },
      },
    },
  }));

  const batch = await client.messages.batches.create({ requests: requests as any });
  console.log(`[batch] creado: ${batch.id}`);
  writeFileSync(join(STATE_DIR, 'batch-id.txt'), batch.id);

  // Poll
  let current = batch;
  const t0 = Date.now();
  while (current.processing_status !== 'ended') {
    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`[batch] ${mins}m · ${current.processing_status} · processing=${current.request_counts.processing} ok=${current.request_counts.succeeded} err=${current.request_counts.errored}`);
    await new Promise((r) => setTimeout(r, 30_000));
    current = await client.messages.batches.retrieve(batch.id);
  }

  console.log(`\n[batch] ✓ completo. ok=${current.request_counts.succeeded} err=${current.request_counts.errored}`);

  // Resultados
  let written = 0;
  let errors = 0;
  for await (const result of await client.messages.batches.results(batch.id)) {
    if (result.result.type !== 'succeeded') {
      console.warn(`[batch] ✗ ${result.custom_id}: ${result.result.type}`);
      errors++;
      continue;
    }
    const msg = result.result.message;
    const text = msg.content.find((b: any) => b.type === 'text')?.text ?? '';
    let newFaqs: FaqItem[];
    try {
      newFaqs = parseFaqs(text);
    } catch (e) {
      console.warn(`[batch] ✗ ${result.custom_id}: parse failed — ${(e as Error).message}`);
      errors++;
      continue;
    }
    // Merge y escribir
    const filePath = join(CALCS_DIR, `${result.custom_id}.json`);
    const calc = JSON.parse(readFileSync(filePath, 'utf8')) as Calc;
    const existing = calc.faq ?? [];
    calc.faq = [...existing, ...newFaqs];
    writeFileSync(filePath, JSON.stringify(calc, null, 2) + '\n');
    written++;
  }

  console.log(`\n[batch] ✓ JSONs actualizados: ${written} · errores: ${errors}`);
  console.log(`[batch] Corré: node --experimental-strip-types scripts/validate-data-updates.ts`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--batch')) {
    await runBatch();
  } else {
    const i = args.indexOf('--sample');
    const n = i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : 3;
    await runSample(n);
  }
}

main().catch((err) => {
  console.error('[backfill-faqs] ✗', err);
  process.exit(1);
});
