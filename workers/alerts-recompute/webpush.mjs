/**
 * webpush.mjs — implementación mínima de Web Push para Cloudflare Workers.
 *
 * Sin dependencias: WebCrypto puro (disponible en Workers y Node 19+).
 *  - Cifrado del payload: RFC 8291 (aes128gcm, un solo record).
 *  - Auth del push service: VAPID / RFC 8292 (JWT ES256).
 *
 * Validada contra el vector de prueba de RFC 8291 §5 (ver scripts del repo).
 *
 * Uso:
 *   import { sendPush } from './webpush.mjs';
 *   const r = await sendPush(subscription, { title, body, url }, {
 *     vapidPublicKey: env.VAPID_PUBLIC_KEY,   // base64url, punto sin comprimir (65 bytes)
 *     vapidPrivateKey: env.VAPID_PRIVATE_KEY, // base64url, escalar de 32 bytes
 *     subject: 'mailto:novedades@hacecuentas.com',
 *   });
 *   if (r.gone) → borrar la suscripción (endpoint muerto, 404/410).
 */

const te = new TextEncoder();

function b64uToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64u(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concat(...arrays) {
  const len = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8));
}

/**
 * Cifra `plaintext` (string) para una subscription según RFC 8291.
 * `testKeys` (solo tests): { asPrivateJwkD, asPublicB64u, saltB64u } para
 * reproducir el vector del RFC con claves/salt fijos.
 */
export async function encryptPayload(subscription, plaintext, testKeys = null) {
  const uaPublic = b64uToBytes(subscription.keys.p256dh); // 65 bytes (0x04 || x || y)
  const authSecret = b64uToBytes(subscription.keys.auth); // 16 bytes

  // Par efímero del "application server" (o fijo en tests)
  let asPrivateKey, asPublicRaw;
  if (testKeys) {
    const pub = b64uToBytes(testKeys.asPublicB64u);
    asPublicRaw = pub;
    asPrivateKey = await crypto.subtle.importKey('jwk', {
      kty: 'EC', crv: 'P-256', d: testKeys.asPrivateJwkD,
      x: bytesToB64u(pub.slice(1, 33)), y: bytesToB64u(pub.slice(33, 65)), ext: true,
    }, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  } else {
    const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    asPrivateKey = kp.privateKey;
    asPublicRaw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  }

  const uaKey = await crypto.subtle.importKey(
    'raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaKey }, asPrivateKey, 256));

  // IKM = HKDF(salt=auth_secret, ikm=ecdh_secret, info="WebPush: info"||0x00||ua_pub||as_pub)
  const keyInfo = concat(te.encode('WebPush: info\0'), uaPublic, asPublicRaw);
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);

  const salt = testKeys ? b64uToBytes(testKeys.saltB64u) : crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);

  // Un solo record: plaintext || 0x02 (delimitador de último record, sin padding extra)
  const record = concat(te.encode(plaintext), new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce }, aesKey, record));

  // Header aes128gcm: salt(16) || record_size(4 BE) || idlen(1)=65 || as_public(65)
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([asPublicRaw.length]), asPublicRaw, ciphertext);
}

/** JWT ES256 para VAPID (RFC 8292). aud = origin del push service. */
async function vapidAuthHeader(endpoint, subject, publicKeyB64u, privateKeyB64u) {
  const pub = b64uToBytes(publicKeyB64u);
  const signKey = await crypto.subtle.importKey('jwk', {
    kty: 'EC', crv: 'P-256', d: privateKeyB64u,
    x: bytesToB64u(pub.slice(1, 33)), y: bytesToB64u(pub.slice(33, 65)), ext: true,
  }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);

  const header = bytesToB64u(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = bytesToB64u(te.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  })));
  const input = `${header}.${payload}`;
  // WebCrypto ECDSA firma en formato raw r||s (64 bytes) = exactamente lo que pide JWS.
  const sig = new Uint8Array(await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, signKey, te.encode(input)));
  return `vapid t=${input}.${bytesToB64u(sig)}, k=${publicKeyB64u}`;
}

/**
 * Envía un push. `payload` puede ser string u objeto (se serializa a JSON).
 * Devuelve { ok, status, gone } — `gone` = endpoint muerto, hay que borrarlo.
 */
export async function sendPush(subscription, payload, opts) {
  const { vapidPublicKey, vapidPrivateKey, subject, ttl = 86400, urgency = 'normal', topic } = opts;
  const body = await encryptPayload(
    subscription, typeof payload === 'string' ? payload : JSON.stringify(payload));
  const headers = {
    Authorization: await vapidAuthHeader(subscription.endpoint, subject, vapidPublicKey, vapidPrivateKey),
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    TTL: String(ttl),
    Urgency: urgency,
  };
  if (topic) headers.Topic = topic; // colapsa notificaciones pendientes del mismo tema
  const resp = await fetch(subscription.endpoint, { method: 'POST', headers, body });
  return { ok: resp.ok, status: resp.status, gone: resp.status === 404 || resp.status === 410 };
}
