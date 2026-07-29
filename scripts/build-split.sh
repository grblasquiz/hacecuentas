#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build en 2 fases con CACHE de worker → prerender rápido en Node (~2.5x).
#
#   STATIC (Node, sin adapter → sin workerd): prerenderea las ~5.800 páginas en
#     ~92s (vs 321s workerd). HTML byte-idéntico (validado 7-10).
#   WORKER (adapter, calc routes NO prerenderean): empaqueta el Worker para las
#     ~40 rutas SSR (api/*, dolar-hoy, etc.). Tarda ~236s (workerd) PERO se CACHEA:
#     solo se rebuildéa cuando cambia código (no contenido). El worker bundlea
#     contenido pero es DEAD (calc pages se sirven estáticas; api/calc usa el
#     compute-index slim). Así, deploys de contenido = solo el static (~92s).
#
# Salida: dist/ (dist/client static de Node + dist/server worker) para wrangler.
# Env: BUILD_SPLIT_FORCE_WORKER=1 fuerza rebuild del worker.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
REPO="$(git rev-parse --show-toplevel)"; cd "$REPO"
export NODE_OPTIONS=--max-old-space-size=8192
CACHE="$REPO/.worker-cache"

SSR_PAGES=(admin.astro dolar-hoy-chile.astro dolar-hoy-colombia.astro dolar-hoy-mexico.astro \
  dolar-hoy-peru.astro dolar-hoy-venezuela.astro donde-ver-mundial-2026.astro \
  partidos-hoy-mundial-2026.astro sugerencias.astro mcp.ts oembed.json.ts)
restore_ssr() {
  [ -d _split_bak/api ] && mv _split_bak/api src/pages/api 2>/dev/null || true
  for f in _split_bak/*.astro _split_bak/*.ts; do [ -f "$f" ] && mv "$f" "src/pages/$(basename "$f")" 2>/dev/null || true; done
  [ -f _split_bak/middleware.ts ] && mv _split_bak/middleware.ts src/middleware.ts 2>/dev/null || true
  rmdir _split_bak 2>/dev/null || true
}

t() { date +%s; }; T0=$(t)
echo "[split] 1/5 prebuild..."; npm run prebuild >/tmp/split-prebuild.log 2>&1 || { echo "prebuild FALLÓ"; tail -15 /tmp/split-prebuild.log; exit 1; }

# ── ¿reusar worker cacheado? Solo si el diff desde que se buildeó es puro
#    contenido/artefactos (detect-changes lo clasifica como incremental/skip/assets). ──
REUSE=false
if [ "${BUILD_SPLIT_FORCE_WORKER:-}" != "1" ] && [ -d "$CACHE/server" ] && [ -f "$CACHE/sha" ]; then
  WK=$(cat "$CACHE/sha")
  if git cat-file -e "$WK" 2>/dev/null; then
    M=$(LAST_DEPLOY_SHA="$WK" node --experimental-strip-types scripts/detect-changes.ts 2>/dev/null | grep '^mode=' | head -1 | cut -d= -f2 || echo full)
    case "$M" in incremental|skip|assets) REUSE=true;; esac
    echo "[split]   worker-cache sha=${WK:0:8} detect=$M → $([ "$REUSE" = true ] && echo 'REUSAR' || echo 'rebuild')"
  fi
fi

if [ "$REUSE" = true ]; then
  echo "[split] 2/5 WORKER: reuso cache (solo cambió contenido)..."
  rm -rf dist dist-static; mkdir -p dist
  cp -R "$CACHE/server" dist/server
  cp -R "$CACHE/client" dist/client
else
  echo "[split] 2/5 WORKER build (cambió código → rebuild)..."
  rm -rf dist dist-static
  BUILD_SPLIT=worker npx astro build >/tmp/split-worker.log 2>&1 || { echo "WORKER build FALLÓ"; tail -25 /tmp/split-worker.log; exit 1; }
  # guardar en cache (dist completo del worker) + sha del commit actual
  rm -rf "$CACHE"; mkdir -p "$CACHE"
  cp -R dist/server "$CACHE/server"; cp -R dist/client "$CACHE/client"
  git rev-parse HEAD > "$CACHE/sha"
fi
[ -f dist/server/entry.mjs ] || { echo "[split] ✗ worker sin entry.mjs — abortar"; exit 1; }

echo "[split] 3/5 STATIC build (Node prerender)..."
mkdir -p _split_bak
mv src/pages/api _split_bak/api
for p in "${SSR_PAGES[@]}"; do mv "src/pages/$p" "_split_bak/$p" 2>/dev/null || true; done
mv src/middleware.ts _split_bak/middleware.ts
trap restore_ssr EXIT
BUILD_SPLIT=static npx astro build >/tmp/split-static.log 2>&1 || { echo "STATIC build FALLÓ"; tail -25 /tmp/split-static.log; restore_ssr; trap - EXIT; exit 1; }
restore_ssr; trap - EXIT
ST=$(find dist-static -name '*.html' 2>/dev/null | wc -l | tr -d ' ')
[ "$ST" -lt 3000 ] && { echo "[split] ✗ static solo $ST HTMLs (esperados >5000) — abortar"; exit 1; }

echo "[split] 4/5 merge static → dist/client ($ST HTMLs)..."
cp -R dist-static/. dist/client/
rm -rf dist-static

echo "[split] 5/5 post-build..."
node scripts/optimize-css-loading.mjs >/dev/null 2>&1
node scripts/strip-pruned-html.mjs    >/dev/null 2>&1
node scripts/strip-html-comments.mjs  >/dev/null 2>&1
node scripts/audit-sitemap-coverage.mjs --check
node scripts/audit-redirect-graph.mjs --check --build-dir=dist/client
node scripts/generate-worker-wrapper.mjs
node --experimental-strip-types scripts/audit-hreflang.ts
node --experimental-strip-types scripts/verify-build-integrity.ts

FINAL=$(find dist/client -name '*.html' 2>/dev/null | wc -l | tr -d ' ')
echo "[split] ✓ LISTO en $(( $(t) - T0 ))s · dist/client=$FINAL HTMLs · worker=$([ -f dist/server/wrapper.mjs ] && echo OK || echo FALTA) · reuse-worker=$REUSE"
