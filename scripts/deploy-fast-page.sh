#!/usr/bin/env bash
# Deploy de landings HTML aisladas: no ejecuta Astro ni reconstruye el worker.
# Requisito: dist/ proviene de un deploy sano previo y public/fast-pages.json
# mapea /ruta a public/_fast-pages/archivo.html.
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
T0=$(date +%s)
[ -f .env ] || { echo '[fast-pages] falta .env'; exit 1; }
set -a; source .env; set +a
for var in CLOUDFLARE_API_TOKEN CLOUDFLARE_ZONE_ID; do [ -n "${!var:-}" ] || { echo "[fast-pages] falta $var"; exit 1; }; done
[ -f dist/server/wrangler.json ] || { echo '[fast-pages] falta dist sano: corré un deploy normal una vez'; exit 1; }
[ ! -f .deploy.lock ] || { echo '[fast-pages] hay otro deploy en curso; reintentá al terminar'; exit 1; }

node scripts/prepare-fast-pages.mjs
node scripts/generate-worker-wrapper.mjs
rm -rf .wrangler/deploy
echo '[fast-pages] subiendo delta a Cloudflare (sin Astro)...'
DEPLOY_LOG=$(mktemp -t hc-fast-pages.XXXXXX)
if ! ( cd dist/server && npx wrangler@latest deploy ) >"$DEPLOY_LOG" 2>&1; then
  tail -40 "$DEPLOY_LOG"; rm -f "$DEPLOY_LOG"; exit 1
fi
grep -E 'No updated asset|Uploaded hacecuentas|Deployed hacecuentas|Current Version|Total Upload' "$DEPLOY_LOG" || true
rm -f "$DEPLOY_LOG"

echo '[fast-pages] purgando rutas fast...'
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const routes = JSON.parse(readFileSync('public/fast-pages.json', 'utf8'));
const files = Object.keys(routes).map((path) => `https://hacecuentas.com${path}`);
if (files.length === 0) {
  console.log('[fast-pages] sin rutas para purgar');
  process.exit(0);
}
const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
  method: 'POST', headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ files }),
});
const data = await res.json();
if (!data.success) throw new Error(JSON.stringify(data.errors));
console.log(`[fast-pages] purgadas ${files.length} ruta(s)`);
NODE
for path in $(node -e "for (const p of Object.keys(require('./public/fast-pages.json'))) console.log(p)"); do
  code=$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "https://hacecuentas.com${path}" || true)
  [ "$code" = 200 ] || { echo "[fast-pages] smoke falló: $path HTTP $code"; exit 1; }
done
echo "[fast-pages] OK — deploy sin Astro terminado en $(( $(date +%s) - T0 ))s"
