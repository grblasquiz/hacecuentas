/**
 * Google Search Console — Indexing Request Script
 *
 * Reads all URLs from public/sitemap.xml and requests Google to index them.
 *
 * === STRATEGIES (in priority order) ===
 *
 * 1. Google Indexing API (requires service account credentials)
 *    - Sends URL_UPDATED notification for each URL
 *    - Best for sites with frequent content changes
 *
 * 2. Sitemap Ping (always works, no credentials)
 *    - Pings Google and Bing with the sitemap URL
 *    - Triggers a crawl/re-crawl of the entire sitemap
 *
 * === SETUP: Google Indexing API ===
 *
 * To use the Indexing API (strategy 1):
 *
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project (or use existing) and enable "Indexing API"
 * 3. Go to IAM & Admin → Service Accounts → Create Service Account
 * 4. Create a JSON key for the service account
 * 5. Save the JSON key file and set env var:
 *      GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account-key.json
 *    OR paste the JSON content inline:
 *      GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
 * 6. In Google Search Console → Settings → Users and permissions
 *    → Add the service account email as an Owner
 *
 * Note: The Indexing API officially supports JobPosting and BroadcastEvent
 * schema types, but Google processes requests for other content types too
 * (they just don't guarantee priority indexing for non-supported types).
 *
 * Usage: npx tsx scripts/submit-gsc.ts
 *        npm run gsc:ping
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const SITE = 'https://hacecuentas.com';
const SITEMAP_URL = `${SITE}/sitemap.xml`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractUrls(sitemapPath: string): string[] {
  const xml = readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Strategy 1: Google Indexing API
// ---------------------------------------------------------------------------

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function loadServiceAccountKey(): ServiceAccountKey | null {
  // Option A: path to JSON file
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonPath && existsSync(jsonPath)) {
    try {
      return JSON.parse(readFileSync(jsonPath, 'utf8'));
    } catch {
      console.log('  ! Could not parse service account JSON file');
    }
  }

  // Option B: inline JSON content
  const jsonContent = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (jsonContent) {
    try {
      return JSON.parse(jsonContent);
    } catch {
      console.log('  ! Could not parse GOOGLE_SERVICE_ACCOUNT_KEY env var');
    }
  }

  return null;
}

/**
 * Create a JWT and exchange it for an access token.
 * Uses Web Crypto (available in Node 20+) — no external deps.
 */
async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: key.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsignedToken = `${enc(header)}.${enc(payload)}`;

  // Import the PEM private key
  const pemContents = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\n/g, '');
  const binaryKey = Buffer.from(pemContents, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const jwt = `${unsignedToken}.${Buffer.from(signature).toString('base64url')}`;

  // Exchange JWT for access token
  const res = await fetch(key.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function submitViaIndexingApi(
  urls: string[],
  accessToken: string
): Promise<{ ok: number; fail: number }> {
  const ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
  const BATCH_DELAY_MS = 100; // be gentle with the API
  let ok = 0;
  let fail = 0;

  for (const url of urls) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      });

      if (res.ok) {
        ok++;
      } else {
        const body = await res.text();
        // Only log first few failures to avoid flooding
        if (fail < 5) {
          console.log(`  ! ${url} -> ${res.status}: ${body.slice(0, 120)}`);
        }
        fail++;
      }
    } catch (err: any) {
      if (fail < 5) console.log(`  ! ${url} -> ${err.message}`);
      fail++;
    }

    await sleep(BATCH_DELAY_MS);
  }

  return { ok, fail };
}

// ---------------------------------------------------------------------------
// Strategy 2: Sitemap Ping (always works)
// ---------------------------------------------------------------------------

async function pingSitemapEndpoints(sitemapUrl: string): Promise<void> {
  const endpoints = [
    {
      name: 'Google',
      url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    },
    {
      name: 'Bing',
      url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      console.log(`  ${res.ok ? '+' : '!'} ${ep.name} sitemap ping -> ${res.status}`);
    } catch (err: any) {
      console.log(`  ! ${ep.name} sitemap ping -> ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('--- Google Search Console Indexing Request ---\n');

  if (!existsSync(SITEMAP)) {
    console.error('ERROR: sitemap.xml not found. Run `npm run sitemap` first.');
    process.exit(1);
  }

  const urls = extractUrls(SITEMAP);
  console.log(`Found ${urls.length} URLs in sitemap.xml\n`);

  // --- Try Indexing API ---
  const key = loadServiceAccountKey();

  if (key) {
    console.log('[1/2] Google Indexing API (service account found)');
    console.log(`  Service account: ${key.client_email}`);
    try {
      const token = await getAccessToken(key);
      console.log(`  Access token obtained. Submitting ${urls.length} URLs...`);
      const { ok, fail } = await submitViaIndexingApi(urls, token);
      console.log(`  Done: ${ok} accepted, ${fail} failed\n`);
    } catch (err: any) {
      console.log(`  ! Auth failed: ${err.message}`);
      console.log('  Skipping Indexing API, falling back to ping only.\n');
    }
  } else {
    console.log('[1/2] Google Indexing API — SKIPPED (no credentials)');
    console.log('  Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY');
    console.log('  See comments at top of this script for setup instructions.\n');
  }

  // --- Always ping sitemap endpoints ---
  console.log('[2/2] Sitemap ping (Google + Bing)');
  await pingSitemapEndpoints(SITEMAP_URL);

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
