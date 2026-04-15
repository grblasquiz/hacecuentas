/**
 * Helper para fetchers auto-llm: le pide a Claude que investigue una fuente
 * oficial con web_search + web_fetch y devuelva datos estructurados validados
 * contra un JSON Schema.
 *
 * Funciona como fetch a la Messages API de Anthropic. Los server-tools
 * (web_search, web_fetch) los ejecuta el server-side, así que una sola
 * llamada HTTP cubre toda la investigación. Al final Claude invoca nuestra
 * tool local `submit_findings` con el JSON estructurado.
 *
 * Fail-soft: si falta API key o el schema no valida, devuelve null y
 * el fetcher logea el error. Nunca tira excepción no-handled.
 *
 * Requiere: ANTHROPIC_API_KEY en env. En GitHub Actions se pasa como secret.
 * Modelo default: claude-sonnet-4-6 (buen equilibrio costo/calidad para
 * research). Para calcs críticas (indemnizaciones, escalas de impuestos),
 * override con claude-opus-4-6.
 */

import { createLogger } from './logger.ts';

const log = createLogger('ask-claude');

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

export interface AskClaudeOpts<T> {
  /** Prompt principal: qué investigar y con qué criterios. */
  task: string;
  /** JSON Schema del output que submit_findings debe respetar. */
  schema: Record<string, unknown>;
  /** Override de API key (por default lee ANTHROPIC_API_KEY). */
  apiKey?: string;
  /** Modelo a usar. Default: claude-sonnet-4-6. */
  model?: string;
  /** Cuántas veces puede usar web_search (default 5). */
  maxSearchUses?: number;
  /** Cuántas veces puede usar web_fetch (default 10). */
  maxFetchUses?: number;
  /** Validador extra post-schema. Si devuelve ok:false, el call falla. */
  validate?: (data: T) => { ok: true } | { ok: false; reason: string };
}

export async function askClaudeStructured<T = unknown>(opts: AskClaudeOpts<T>): Promise<T | null> {
  const apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log.error('ANTHROPIC_API_KEY no está definida — auto-llm deshabilitado');
    return null;
  }
  const model = opts.model || DEFAULT_MODEL;

  const payload = {
    model,
    max_tokens: 8000,
    tools: [
      { type: 'web_search_20250305', name: 'web_search', max_uses: opts.maxSearchUses ?? 5 },
      { type: 'web_fetch_20250910', name: 'web_fetch', max_uses: opts.maxFetchUses ?? 10 },
      {
        name: 'submit_findings',
        description:
          'Devolvé los datos estructurados finales acá después de investigar. ' +
          'No uses texto libre — toda la respuesta va en el input de esta tool.',
        input_schema: opts.schema,
      },
    ],
    // Forzar que termine invocando alguna tool (idealmente submit_findings)
    tool_choice: { type: 'any' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              `${opts.task}\n\n` +
              `IMPORTANTE: investigá primero con web_search y web_fetch, y cuando tengas toda la info llamá a submit_findings con el JSON estructurado final. ` +
              `No respondas con texto libre.`,
          },
        ],
      },
    ],
  };

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Beta header necesario para web_fetch_20250910
        'anthropic-beta': 'web-fetch-2025-09-10',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    log.error(`fetch falló: ${(err as Error).message}`);
    return null;
  }

  if (!res.ok) {
    const body = await res.text();
    log.error(`API respondió ${res.status}: ${body.slice(0, 500)}`);
    return null;
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; name?: string; input?: unknown }>;
    stop_reason?: string;
    usage?: { input_tokens: number; output_tokens: number };
  };

  // Buscar la invocación local de submit_findings (ignorando server-tool calls)
  const submit = data.content?.find((b) => b.type === 'tool_use' && b.name === 'submit_findings');
  if (!submit) {
    log.error(`Claude no invocó submit_findings (stop_reason=${data.stop_reason || 'n/a'})`);
    // Para debug: listar qué tipos de blocks vinieron
    const types = (data.content || []).map((b) => `${b.type}${b.name ? `:${b.name}` : ''}`).join(', ');
    log.error(`content blocks recibidos: ${types}`);
    return null;
  }

  const result = submit.input as T;

  if (opts.validate) {
    const check = opts.validate(result);
    if (!check.ok) {
      log.error(`validación extra falló: ${check.reason}`);
      return null;
    }
  }

  if (data.usage) {
    const inTok = data.usage.input_tokens.toLocaleString('es-AR');
    const outTok = data.usage.output_tokens.toLocaleString('es-AR');
    log.info(`usage: ${inTok} in / ${outTok} out tokens (${model})`);
  }

  return result;
}
