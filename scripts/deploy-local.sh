#!/usr/bin/env bash
#
# Deploy local desde Mac con build incremental — la idea es ~30-60s total
# cuando solo cambian 1-5 calcs (vs 5-7 min full build).
#
# Cómo funciona:
#   1. Lee el SHA del último deploy exitoso desde .last-deploy-sha (gitignored)
#   2. Corre scripts/detect-changes.ts contra ese SHA
#   3. Si el detect dice "incremental": setea INCREMENTAL_CHANGES env, NO limpia
#      dist (emptyOutDir:false), Astro filtra getStaticPaths y solo regenera
#      los HTMLs de los slugs cambiados (vs ~5666 del full).
#   4. Si dice "full" o no hay SHA previo: clean dist + build completo.
#   5. wrangler deploy (delta upload nativo, solo archivos cambiados).
#   6. Purge CF cache (selectivo en incremental, full en otro caso).
#   7. Smoke test 5 URLs críticas.
#   8. Guarda el SHA actual en .last-deploy-sha para la próxima.
#
# Uso:
#   npm run deploy                  # full o incremental según detect
#   npm run deploy -- --force-full  # forzar full (útil si querés clean slate)
#   npm run deploy -- --no-purge    # skip purge (deploys de prueba)
#   npm run deploy -- --no-smoke    # skip smoke test
#
# Requisitos:
#   .env con CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID
#
# Author: 2026-05-25
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()  { echo -e "${GREEN}[deploy] ✓${NC} $1"; }
warn(){ echo -e "${YELLOW}[deploy] ⚠${NC} $1"; }
err() { echo -e "${RED}[deploy] ✗${NC} $1"; }

# Parse args
PURGE=true
SMOKE=true
FORCE_FULL=false
for arg in "$@"; do
  case "$arg" in
    --no-purge)   PURGE=false ;;
    --no-smoke)   SMOKE=false ;;
    --force-full) FORCE_FULL=true ;;
  esac
done

T_START=$(date +%s)

# ─── 1. Validación ────────────────────────────────────────────────────────
log "validando estado del repo..."
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  warn "no estás en main (estás en '$BRANCH'). Continuar? [y/N]"
  read -r confirm
  [ "$confirm" = "y" ] || { err "abortado"; exit 1; }
fi

if [ -n "$(git status --porcelain | grep -v 'sitemap\|search-index\|sw\.js\|og-manifest\|related-auto\|db/sitemap-state')" ]; then
  warn "hay cambios sin commitear (no-artifacts). Solo lo committeado va al deploy."
  git status --short | grep -v 'sitemap\|search-index\|sw\.js\|og-manifest\|related-auto\|db/sitemap-state' | head -5
fi

if [ ! -f .env ]; then
  err ".env no existe. Necesita CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID."
  exit 1
fi
# shellcheck disable=SC1091
set -a; source .env; set +a

for var in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID; do
  if [ -z "${!var:-}" ]; then
    err "$var no está en .env"; exit 1
  fi
done

CURRENT_SHA=$(git rev-parse HEAD)
ok "validación OK | branch=$BRANCH | commit=${CURRENT_SHA:0:8}"

# ─── 2. Detect changes ────────────────────────────────────────────────────
MODE=full
INCREMENTAL_CHANGES=""
if [ "$FORCE_FULL" = true ]; then
  log "modo forzado: FULL build"
elif [ ! -f .last-deploy-sha ]; then
  log "sin .last-deploy-sha previo → FULL build"
else
  LAST_SHA=$(cat .last-deploy-sha | tr -d '[:space:]')
  if [ "$LAST_SHA" = "$CURRENT_SHA" ]; then
    warn "sin cambios desde el último deploy (HEAD=${CURRENT_SHA:0:8}). Forzando full igual."
  else
    log "diff desde ${LAST_SHA:0:8}..."
    DETECT_OUT=$(LAST_DEPLOY_SHA="$LAST_SHA" node --experimental-strip-types scripts/detect-changes.ts 2>&1) || DETECT_OUT="ERROR"
    if echo "$DETECT_OUT" | grep -q "^mode=skip"; then
      REASON=$(echo "$DETECT_OUT" | grep "^reason=" | sed 's/^reason=//')
      ok "SKIP — $REASON"
      echo "Solo cambios en tooling/docs. Nada que deployar. Saliendo en $(($(date +%s) - T_START))s."
      echo "$CURRENT_SHA" > .last-deploy-sha
      exit 0
    elif echo "$DETECT_OUT" | grep -q "^mode=incremental"; then
      MODE=incremental
      INCREMENTAL_CHANGES=$(echo "$DETECT_OUT" | grep "^changes_json=" | sed 's/^changes_json=//')
      REASON=$(echo "$DETECT_OUT" | grep "^reason=" | sed 's/^reason=//')
      ok "modo INCREMENTAL — $REASON"
      echo "    changes: $INCREMENTAL_CHANGES" | head -c 300
      echo ""
    else
      REASON=$(echo "$DETECT_OUT" | grep "^reason=" | sed 's/^reason=//' || echo "desconocido")
      log "modo FULL — $REASON"
    fi
  fi
fi

# ─── 3. Build ──────────────────────────────────────────────────────────────
T_BUILD_START=$(date +%s)
if [ "$MODE" = "incremental" ]; then
  log "build INCREMENTAL (estimado ~60-90s)..."
  # NO limpiamos dist — emptyOutDir:false en astro.config.mjs preserva los
  # HTMLs cacheados; Astro solo regenera los slugs cambiados.
  export INCREMENTAL_CHANGES
  npm run build 2>&1 | grep -E "(\[(prebuild|incremental|build|vite|wrap-worker|strip-pruned|optimize-css)\]|Server built|Completed in|✓ built in|EXIT|Files processed)" | tail -25
else
  log "build FULL (estimado ~3-5min)..."
  rm -rf dist
  unset INCREMENTAL_CHANGES
  npm run build 2>&1 | grep -E "(\[(prebuild|build|vite|wrap-worker|strip-pruned|optimize-css)\]|Server built|Completed in|✓ built in|EXIT|Files processed)" | tail -20
fi
T_BUILD=$(($(date +%s) - T_BUILD_START))
ok "build $MODE completado en ${T_BUILD}s"

# ─── 4. Cleanup pre-deploy ────────────────────────────────────────────────
rm -rf .wrangler/deploy 2>/dev/null || true

# ─── 5. Wrangler deploy ────────────────────────────────────────────────────
T_DEPLOY_START=$(date +%s)
log "wrangler deploy desde dist/server..."
cd dist/server
npx wrangler@latest deploy 2>&1 | grep -E "(Uploaded.*assets|Success|Total Upload|Worker Startup|Current Version|error|Error)" | head -10
cd "$REPO_ROOT"
T_DEPLOY=$(($(date +%s) - T_DEPLOY_START))
ok "wrangler deploy completado en ${T_DEPLOY}s"

# ─── 6. Purge CF cache ────────────────────────────────────────────────────
if [ "$PURGE" = true ]; then
  log "purge CF cache..."
  if [ "$MODE" = "incremental" ] && [ -n "$INCREMENTAL_CHANGES" ]; then
    # Purge selectivo — solo URLs cambiadas + sitemaps.
    INCREMENTAL_MODE=incremental \
      INCREMENTAL_CHANGES="$INCREMENTAL_CHANGES" \
      CF_TOKEN="$CLOUDFLARE_API_TOKEN" \
      CF_ZONE="$CLOUDFLARE_ZONE_ID" \
      node --experimental-strip-types scripts/incremental-purge.ts 2>&1 | tail -5
  else
    # Purge total
    PURGE_RESP=$(curl -sS -X POST \
      "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}')
    if echo "$PURGE_RESP" | grep -q '"success":true'; then
      ok "cache purgado (full)"
    else
      warn "purge falló: $PURGE_RESP"
    fi
  fi
else
  warn "purge skip (--no-purge)"
fi

# ─── 7. Smoke test ────────────────────────────────────────────────────────
if [ "$SMOKE" = true ]; then
  log "smoke test (5 URLs críticas)..."
  sleep 5
  FAIL=0
  for url in / /calculadora-imc /calculadora-aguinaldo-sac /en/bmi-calculator /sitemap.xml; do
    STATUS=$(curl -sS -o /dev/null -w "%{http_code}" -A "HC-LocalDeploy/1.0" "https://hacecuentas.com$url" || echo "ERR")
    if [ "$STATUS" = "200" ]; then
      echo "  ✓ $url"
    else
      echo -e "  ${RED}✗${NC} $url (HTTP $STATUS)"
      FAIL=$((FAIL + 1))
    fi
  done
  if [ "$FAIL" -gt 0 ]; then
    warn "$FAIL/5 URLs fallaron — revisar en https://hacecuentas.com"
  else
    ok "smoke test OK"
  fi
else
  warn "smoke skip (--no-smoke)"
fi

# ─── 8. Guardar SHA actual para próximo incremental ───────────────────────
echo "$CURRENT_SHA" > .last-deploy-sha

# ─── Resumen ──────────────────────────────────────────────────────────────
T_TOTAL=$(($(date +%s) - T_START))
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOY OK${NC}  | mode: $MODE | total: ${T_TOTAL}s (build ${T_BUILD}s + deploy ${T_DEPLOY}s)"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo "Probar en https://hacecuentas.com"
