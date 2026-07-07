/**
 * Stub de `cloudflare:workers` para los tests (vitest lo aliasea acá).
 * `env` es un objeto mutable: un test setea `env.SESSION = fakeKV` para
 * ejercitar helpers que leen bindings vía getEnv() en src/lib/api-utils.ts.
 */
export const env: Record<string, unknown> = {};
