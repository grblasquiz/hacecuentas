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
