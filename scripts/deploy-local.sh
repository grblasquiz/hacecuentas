#!/usr/bin/env bash
#
# Deploy local desde Mac, sin pasar por GitHub Actions.
#
# Por qué: CI tarda 7-10 min (npm ci + cold runner + smoke test) y bloquea
# trabajo. Build local con cache caliente es ~90s + wrangler deploy ~30s.
#
# Uso:
#   npm run deploy       # con purge selectivo (purge_everything)
#   npm run deploy -- --no-purge   # skip purge (para deploys de prueba)
#   npm run deploy -- --no-smoke   # skip smoke test post-deploy
#
# Requisitos:
#   .env con CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID
#
# Notas:
#   - Los crons de GH Actions (data-refresh, sitemap, indexnow, bing-submit,
#     etc.) siguen corriendo en background. Solo cambia los deploys manuales.
#   - El workflow .github/workflows/deploy.yml SIGUE existiendo y se dispara
#     en cada push a main. Si querés deshabilitarlo, comentá el `on: push`.
#
# Author: 2026-05-25
set -e

# Colores para output más claro
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
  echo -e "${CYAN}[deploy]${NC} $1"
}
ok() {
  echo -e "${GREEN}[deploy] ✓${NC} $1"
}
warn() {
  echo -e "${YELLOW}[deploy] ⚠${NC} $1"
}
err() {
  echo -e "${RED}[deploy] ✗${NC} $1"
}

# Parse args
PURGE=true
SMOKE=true
for arg in "$@"; do
  case "$arg" in
    --no-purge) PURGE=false ;;
    --no-smoke) SMOKE=false ;;
  esac
done

T_START=$(date +%s)

# ─── 1. Validación pre-deploy ─────────────────────────────────────────────
log "validando estado del repo..."

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  warn "no estás en main (estás en '$BRANCH'). Continuar? [y/N]"
  read -r confirm
  [ "$confirm" = "y" ] || { err "abortado"; exit 1; }
fi

if [ -n "$(git status --porcelain)" ]; then
  warn "hay cambios sin commitear. Solo lo que está committeado va al deploy."
  git status --short | head -5
fi

# Cargar .env
if [ ! -f .env ]; then
  err ".env no existe. Necesita CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID."
  exit 1
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

for var in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID; do
  if [ -z "${!var:-}" ]; then
    err "$var no está en .env"
    exit 1
  fi
done

ok "validación OK | branch=$BRANCH | commit=$(git rev-parse --short HEAD)"

# ─── 2. Build ──────────────────────────────────────────────────────────────
T_BUILD_START=$(date +%s)
log "build (esto tarda ~90s con cache caliente, ~3min cold)..."
npm run build 2>&1 | tail -3
T_BUILD=$(($(date +%s) - T_BUILD_START))
ok "build completado en ${T_BUILD}s"

# ─── 3. Cleanup pre-deploy ────────────────────────────────────────────────
# El adapter @astrojs/cloudflare genera dos wrangler configs (dist/server y
# .wrangler/deploy). Wrangler aborta si encuentra los dos.
rm -rf .wrangler/deploy 2>/dev/null || true

# ─── 4. Wrangler deploy ────────────────────────────────────────────────────
T_DEPLOY_START=$(date +%s)
log "wrangler deploy desde dist/server..."
cd dist/server
npx wrangler@latest deploy 2>&1 | grep -E "(Uploaded|Deployed|Total Upload|Worker Startup|Current Version|Versions|error|Error)" | head -10
cd "$REPO_ROOT"
T_DEPLOY=$(($(date +%s) - T_DEPLOY_START))
ok "wrangler deploy completado en ${T_DEPLOY}s"

# ─── 5. Purge CF cache ────────────────────────────────────────────────────
if [ "$PURGE" = true ]; then
  log "purge CF cache..."
  PURGE_RESP=$(curl -sS -X POST \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}')
  if echo "$PURGE_RESP" | grep -q '"success":true'; then
    ok "cache purgado"
  else
    warn "purge falló (no bloqueante): $PURGE_RESP"
  fi
else
  warn "purge skip (--no-purge)"
fi

# ─── 6. Smoke test ────────────────────────────────────────────────────────
if [ "$SMOKE" = true ]; then
  log "smoke test (5 URLs críticas)..."
  sleep 5  # mini propagación
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

# ─── Resumen ──────────────────────────────────────────────────────────────
T_TOTAL=$(($(date +%s) - T_START))
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOY OK${NC}  | total: ${T_TOTAL}s (build ${T_BUILD}s + deploy ${T_DEPLOY}s)"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo "Probar en https://hacecuentas.com"
echo "Si algo se rompió: revisar Sentry o CF Workers logs."
