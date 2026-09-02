/**
 * Colector de estado de ejecución por fetcher para el summary final.
 *
 * Objetivo: que la falta de ANTHROPIC_API_KEY NUNCA deshabilite nada en
 * silencio. Cada fetcher (o el orchestrator, vía metadata `path` del registry)
 * reporta acá con qué modo corrió efectivamente:
 *
 *   - 'deterministic': usó fuente estructurada / tabla con vigencia / API.
 *   - 'llm':           usó ask-claude (había key).
 *   - 'pending':       necesitaba LLM y no había key, o cronograma vencido
 *                      sin fallback → WARN visible, no error.
 *
 * Los WARN se acumulan y el orchestrator los imprime todos juntos al final
 * además del log inline del fetcher.
 */

import { existsSync, readdirSync } from 'node:fs';

export type RunMode = 'deterministic' | 'llm' | 'pending';

const modes = new Map<string, RunMode>();
const warns: Array<{ name: string; msg: string }> = [];

/** Modo efectivo con el que corrió el fetcher (el último reporte gana). */
export function reportMode(name: string, mode: RunMode): void {
  modes.set(name, mode);
}

/** WARN visible: se loguea inline (stderr) y se repite en el summary final. */
export function reportWarn(name: string, msg: string): void {
  warns.push({ name, msg });
  console.error(`[${name}] ⚠ WARN: ${msg}`);
}

export function getRunStatus(): {
  modes: Record<string, RunMode>;
  warns: Array<{ name: string; msg: string }>;
} {
  return { modes: Object.fromEntries(modes), warns: [...warns] };
}

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ── Fallback local: Claude Code CLI (suscripción, sin API key) ───────────────
// ask-claude.ts puede resolver el paso LLM shelleando a `claude -p` cuando no
// hay ANTHROPIC_API_KEY. Detectamos el binario una sola vez y lo cacheamos.

let cliPathCache: string | null | undefined;
let llmRuntimeUnavailable = false;

/** Marca que el camino LLM existe pero falló en ejecución (por ejemplo, OAuth vencido). */
export function reportLlmUnavailable(): void {
  llmRuntimeUnavailable = true;
}

/**
 * Binario del CLI bundleado por la app de escritorio (siempre el más nuevo).
 * El de /usr/local/bin suele estar viejo (2.1.76, falla el refresh OAuth).
 */
function appBundledCli(): string | null {
  const base = `${process.env.HOME || ''}/Library/Application Support/Claude/claude-code`;
  if (!existsSync(base)) return null;
  const versions = readdirSync(base)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
    });
  for (const v of versions.reverse()) {
    const bin = `${base}/${v}/claude.app/Contents/MacOS/claude`;
    if (existsSync(bin)) return bin;
  }
  return null;
}

/** Ruta al binario `claude` local, o null si no hay. Override: CLAUDE_CLI_BIN. */
export function localClaudeCliPath(): string | null {
  if (cliPathCache !== undefined) return cliPathCache;
  const candidates = [
    process.env.CLAUDE_CLI_BIN,
    appBundledCli(),
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    `${process.env.HOME || ''}/.local/bin/claude`,
  ].filter(Boolean) as string[];
  cliPathCache = candidates.find((p) => existsSync(p)) ?? null;
  return cliPathCache;
}

export function hasLocalClaudeCli(): boolean {
  return localClaudeCliPath() !== null;
}

/**
 * ¿Hay ALGÚN camino LLM disponible? (API key o CLI local por suscripción).
 * Los fetchers hybrid/llm deben chequear esto — no hasAnthropicKey() — para
 * decidir si intentan el paso LLM.
 */
export function hasLlmAccess(): boolean {
  return !llmRuntimeUnavailable && (hasAnthropicKey() || hasLocalClaudeCli());
}
