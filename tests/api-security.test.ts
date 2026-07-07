/**
 * Tests de los helpers de seguridad agregados en el hardening 2026-07-06:
 *   - constantTimeEqual  (comparación de secretos sin timing oracle)
 *   - isAdminAuthed      (header X-Admin-Key con fallback ?k=, constant-time)
 *   - enforceRateLimit   (rate-limit por IP con KV, ventana fija, fail-open)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { env as stubEnv } from './stubs/cloudflare-workers';
import { constantTimeEqual, isAdminAuthed, enforceRateLimit } from '../src/lib/api-utils';

/** KV fake en memoria con expiración (imita KVNamespace.get/put). */
function makeKV() {
  const store = new Map<string, { v: string; exp: number }>();
  return {
    async get(k: string) {
      const e = store.get(k);
      if (!e) return null;
      if (e.exp && e.exp < Date.now()) { store.delete(k); return null; }
      return e.v;
    },
    async put(k: string, v: string, opts?: { expirationTtl?: number }) {
      store.set(k, { v, exp: opts?.expirationTtl ? Date.now() + opts.expirationTtl * 1000 : 0 });
    },
  };
}

function req(headers: Record<string, string> = {}, url = 'https://hacecuentas.com/api/x') {
  return new Request(url, { headers });
}

describe('constantTimeEqual', () => {
  it('true solo para strings idénticos', () => {
    expect(constantTimeEqual('s3cr3t', 's3cr3t')).toBe(true);
    expect(constantTimeEqual('', '')).toBe(true);
  });
  it('false para valor distinto o longitud distinta', () => {
    expect(constantTimeEqual('s3cr3t', 's3cr3X')).toBe(false);
    expect(constantTimeEqual('s3cr3t', 's3cr3')).toBe(false);
    // @ts-expect-error — robustez ante no-strings
    expect(constantTimeEqual('x', undefined)).toBe(false);
  });
});

describe('isAdminAuthed', () => {
  it('acepta la clave por header X-Admin-Key', () => {
    expect(isAdminAuthed(req({ 'x-admin-key': 'pass' }), ['pass'])).toBe(true);
  });
  it('acepta la clave por ?k= (compat con la página /admin)', () => {
    expect(isAdminAuthed(req({}, 'https://hacecuentas.com/api/x?k=pass'), ['pass'])).toBe(true);
  });
  it('matchea cualquiera de las claves válidas (ADMIN_PASSCODE / BACKFILL_KEY)', () => {
    expect(isAdminAuthed(req({ 'x-admin-key': 'backfill' }), ['pass', 'backfill'])).toBe(true);
  });
  it('rechaza clave incorrecta, ausente, o cuando no hay claves configuradas', () => {
    expect(isAdminAuthed(req({ 'x-admin-key': 'nope' }), ['pass'])).toBe(false);
    expect(isAdminAuthed(req({}), ['pass'])).toBe(false);
    expect(isAdminAuthed(req({ 'x-admin-key': 'x' }), [undefined, ''])).toBe(false);
  });
});

describe('enforceRateLimit', () => {
  beforeEach(() => { for (const k of Object.keys(stubEnv)) delete stubEnv[k]; });

  it('fail-open (null) cuando no hay binding SESSION', async () => {
    expect(await enforceRateLimit(req(), 'bucket', 1, 60)).toBeNull();
  });

  it('permite hasta el límite y luego devuelve 429 con retry-after', async () => {
    stubEnv.SESSION = makeKV();
    const r = req({ 'cf-connecting-ip': '1.2.3.4' });
    expect(await enforceRateLimit(r, 'bucket', 2, 60)).toBeNull();
    expect(await enforceRateLimit(r, 'bucket', 2, 60)).toBeNull();
    const blocked = await enforceRateLimit(r, 'bucket', 2, 60);
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    expect(blocked!.headers.get('retry-after')).toBeTruthy();
  });

  it('cuenta por IP: distinta IP = contador independiente', async () => {
    stubEnv.SESSION = makeKV();
    const a = req({ 'cf-connecting-ip': '1.1.1.1' });
    const b = req({ 'cf-connecting-ip': '2.2.2.2' });
    expect(await enforceRateLimit(a, 'bucket', 1, 60)).toBeNull();
    expect((await enforceRateLimit(a, 'bucket', 1, 60))!.status).toBe(429);
    expect(await enforceRateLimit(b, 'bucket', 1, 60)).toBeNull();
  });

  it('buckets distintos no se pisan', async () => {
    stubEnv.SESSION = makeKV();
    const r = req({ 'cf-connecting-ip': '3.3.3.3' });
    expect(await enforceRateLimit(r, 'b1', 1, 60)).toBeNull();
    expect(await enforceRateLimit(r, 'b2', 1, 60)).toBeNull();
  });

  it('fail-open si el KV tira una excepción (nunca bloquea por infra)', async () => {
    stubEnv.SESSION = { get: async () => { throw new Error('kv down'); }, put: async () => {} };
    expect(await enforceRateLimit(req({ 'cf-connecting-ip': '4.4.4.4' }), 'bucket', 1, 60)).toBeNull();
  });
});
