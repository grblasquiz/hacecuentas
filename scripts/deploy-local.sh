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

# ─── 1b. Auto-commit PRE-build ─────────────────────────────────────────────
# detect-changes (abajo) diffea last-deploy-sha...HEAD → SOLO commits, no el
# working tree. Si el laburo queda sin commitear, HEAD==last-deploy-sha → fuerza
# FULL build siempre (lento + OOM) y la pila de "cambios sin commitear" se
# acumula y reaparece en cada deploy. Commiteando ANTES del detect, el trabajo
# entra como diff → incremental funciona y el árbol no acumula nada.
if [ -n "$(git status --porcelain)" ]; then
  log "auto-commit pre-build de cambios sin commitear..."
  git add -A
  if git commit -q --no-verify -m "chore(deploy): cambios pre-build [auto]"; then
    CURRENT_SHA=$(git rev-parse HEAD)
    ok "commiteado pre-build (auto) → ${CURRENT_SHA:0:8} | detect puede ir incremental"
  else
    warn "auto-commit pre-build no hizo nada"
  fi
fi

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
    ok "SKIP — sin cambios desde el último deploy (HEAD=${CURRENT_SHA:0:8})"
    echo "Nada que deployar. Saliendo en $(($(date +%s) - T_START))s."
    exit 0
  else
    log "diff desde ${LAST_SHA:0:8}..."
    DETECT_OUT=$(LAST_DEPLOY_SHA="$LAST_SHA" node --experimental-strip-types scripts/detect-changes.ts 2>&1) || DETECT_OUT="ERROR"
    if echo "$DETECT_OUT" | grep -q "^mode=skip"; then
      REASON=$(echo "$DETECT_OUT" | grep "^reason=" | sed 's/^reason=//')
      ok "SKIP — $REASON"
      echo "Solo cambios en tooling/docs. Nada que deployar. Saliendo en $(($(date +%s) - T_START))s."
      echo "$CURRENT_SHA" > .last-deploy-sha
      exit 0
    elif echo "$DETECT_OUT" | grep -q "^mode=assets"; then
      MODE=assets
      INCREMENTAL_CHANGES=$(echo "$DETECT_OUT" | grep "^changes_json=" | sed 's/^changes_json=//')
      REASON=$(echo "$DETECT_OUT" | grep "^reason=" | sed 's/^reason=//')
      ok "modo ASSETS — $REASON"
      echo "    changes: $INCREMENTAL_CHANGES" | head -c 300
      echo ""
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
SPLIT_BUILD=false
if [ "${BUILD_SPLIT_DEPLOY:-}" = "1" ]; then
  # Arquitectura 2-builds: STATIC en Node (~92s, 4x) + WORKER cacheado (solo
  # rebuild si cambió código, no contenido). Regenera todo el static → purge full.
  SPLIT_BUILD=true; MODE=full
  log "build SPLIT (Node static + worker cacheado)..."
  bash scripts/build-split.sh 2>&1 | grep -E "\[split\]|FALLÓ|✗ " | tail -16
fi
if [ "$SPLIT_BUILD" = false ] && [ "$MODE" = "assets" ]; then
  log "deploy ASSETS (sin Astro build)..."
  if [ ! -f dist/server/wrapper.mjs ] || [ ! -f dist/server/wrangler.json ] || [ ! -d dist/client ]; then
    warn "dist cache incompleto → fallback FULL build"
    MODE=full
  else
    ASSET_CHANGES="$INCREMENTAL_CHANGES" node --input-type=module <<'NODE'
import { dirname, join } from 'node:path';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const raw = process.env.ASSET_CHANGES || '{}';
const changes = JSON.parse(raw);
for (const file of changes.assets?.paths || []) {
  const rel = file.replace(/^public\//, '');
  const dst = join('dist/client', rel);
  if (existsSync(file)) {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(file, dst);
    console.log(`[assets] copied ${file} → ${dst}`);
  } else {
    rmSync(dst, { force: true, recursive: true });
    console.log(`[assets] removed ${dst}`);
  }
}
NODE
  fi
fi

if [ "$SPLIT_BUILD" = true ] || [ "$MODE" = "assets" ]; then
  :
elif [ "$MODE" = "incremental" ]; then
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
if [ "$MODE" = "assets" ]; then
  ok "assets preparados en ${T_BUILD}s"
else
  ok "build $MODE completado en ${T_BUILD}s"
fi

# ─── 3b. Verificar el build ANTES de subirlo (no deployar un build roto) ───
# Incidente 2026-06-01: un build con prerender vacío (1 HTML en vez de ~3800)
# se deployó y dejó TODO en 404 (home + calcs + /es). Gate: cantidad de HTMLs
# en dist/client + worker wrapper. Si el prerender salió vacío, abortamos SIN
# tocar la versión live.
if [ ! -f dist/server/wrapper.mjs ]; then
  err "dist/server/wrapper.mjs no existe — build incompleto (wrap-worker no corrió). NO deployo."
  exit 1
fi
HTML_COUNT=$(find dist/client -name '*.html' 2>/dev/null | wc -l | tr -d ' ')
MIN_HTML=2000
if [ "$HTML_COUNT" -lt "$MIN_HTML" ]; then
  err "prerender ROTO: solo $HTML_COUNT HTMLs en dist/client (esperados ≥$MIN_HTML). NO deployo — el sitio en vivo queda intacto."
  exit 1
fi
ok "build verificado: $HTML_COUNT HTMLs + wrapper.mjs"

# ─── 3b. Gate: páginas rotas por error de prerender ───────────────────────
# El adapter CF prerenderea en workerd; si una página tira en render (p.ej.
# "Illegal invocation" por I/O pendiente, ver src/lib/fetch-timeout.ts) el
# adapter escribe el ERROR como el HTML de esa página (stub ~300b o vacío) SIN
# fallar el build (exit 0). El smoke test (6 URLs) no lo cataba → se publicaban
# páginas rotas en silencio (/desarrolladores quedó 0 bytes en prod semanas).
# Gate: abortar si alguna HTML contiene el error o quedó vacía.
# `|| true`: grep -rl devuelve exit 1 cuando NO hay matches (= caso bueno) y con
# `set -e` eso abortaría el deploy en el caso exitoso. Lo neutralizamos.
BROKEN=$(grep -rl --include='*.html' 'Illegal invocation' dist/client 2>/dev/null || true)
EMPTY=$(find dist/client -name '*.html' -size 0 2>/dev/null || true)
if [ -n "$BROKEN" ] || [ -n "$EMPTY" ]; then
  err "PÁGINAS ROTAS en el build (error de prerender) — NO deployo:"
  [ -n "$BROKEN" ] && printf '%s\n' "$BROKEN" | sed 's,^dist/client/,  · ,'
  [ -n "$EMPTY" ]  && printf '%s\n' "$EMPTY"  | sed 's,^dist/client/,  · (vacía) ,'
  err "Causa típica: I/O pendiente en prerender (usar fetchWithTimeout, no AbortSignal.timeout). El sitio en vivo queda intacto."
  exit 1
fi
ok "sin páginas rotas (prerender limpio)"

# ─── 4. Cleanup pre-deploy ────────────────────────────────────────────────
rm -rf .wrangler/deploy 2>/dev/null || true
# dist/server/.prerender/ son chunks build-time (generan el HTML); el runtime
# entry.mjs NO los importa. Pero con no_bundle:true wrangler sube TODO dist/server
# → +51 MiB de dead weight → el worker supera 64 MiB y CF lo rechaza (code 10027).
# Sin esto, el deploy queda en false-OK (asset upload "Success" pero worker viejo).
rm -rf dist/server/.prerender 2>/dev/null || true

# ─── 5. Wrangler deploy ────────────────────────────────────────────────────
T_DEPLOY_START=$(date +%s)
log "wrangler deploy desde dist/server..."
cd dist/server
# Capturamos output + RC reales (antes el pipe a grep enmascaraba el exit code
# de wrangler → false-OK). Fallamos fuerte si el worker fue rechazado.
set -o pipefail
DEPLOY_OUT=$(npx wrangler@latest deploy 2>&1); DEPLOY_RC=$?
set +o pipefail
echo "$DEPLOY_OUT" | grep -E "(Uploaded.*assets|Success|Total Upload|Worker Startup|Current Version|error|Error)" | head -10
if [ "$DEPLOY_RC" -ne 0 ] || echo "$DEPLOY_OUT" | grep -qE "uncompressed size limit|code: 10027"; then
  cd "$REPO_ROOT"
  err "wrangler RECHAZÓ el worker (size>64MiB o error). NO está en vivo — revisá el bundle."
  exit 1
fi
cd "$REPO_ROOT"
T_DEPLOY=$(($(date +%s) - T_DEPLOY_START))
ok "wrangler deploy completado en ${T_DEPLOY}s"

# ─── 6. Smoke test (ANTES del purge — gate de seguridad) ───────────────────
# HTML es CDN no-store → el smoke pega al worker recién deployado, no a cache
# vieja. Si las rutas root/catch-all fallan (build/worker roto), AUTO-ROLLBACK
# a la versión previa y abortamos SIN purgar cache → una versión rota nunca
# queda viva ni se cachea. Incidente 2026-06-01 (deploy con prerender vacío).
if [ "$SMOKE" = true ]; then
  log "smoke test (pre-purge)..."
  sleep 5
  FAIL=0
  # Cubre estático (calc/home/locale), embed (asset), ruta SSR (dolar-hoy → valida
  # que el worker sirve SSR) y sitemap. Un break del split-build cae acá → rollback.
  for url in / /calculadora-imc /calculadora-aguinaldo-sac /en/bmi-calculator /es /sitemap.xml /embed/calculadora-imc /dolar-hoy-mexico; do
    STATUS=$(curl -sS -o /dev/null -w "%{http_code}" -A "HC-LocalDeploy/1.0" "https://hacecuentas.com$url" || echo "ERR")
    if [ "$STATUS" = "200" ]; then
      echo "  ✓ $url"
    else
      echo -e "  ${RED}✗${NC} $url (HTTP $STATUS)"
      FAIL=$((FAIL + 1))
    fi
  done
  if [ "$FAIL" -gt 0 ]; then
    err "$FAIL URLs fallaron — la versión deployada está ROTA. Auto-rollback a la previa..."
    ( cd dist/server && printf 'y\ny\n' | npx wrangler@latest rollback --message "auto-rollback: smoke falló ($FAIL URLs)" 2>&1 | tail -6 )
    err "rollback ejecutado · cache NO purgado · el sitio quedó en la versión previa. Revisá el build antes de reintentar."
    exit 1
  fi
  ok "smoke test OK — versión sana"
else
  warn "smoke skip (--no-smoke) — SIN gate de seguridad post-deploy"
fi

# ─── 7. Purge CF cache (solo si el smoke pasó) ─────────────────────────────
if [ "$PURGE" = true ]; then
  log "purge CF cache..."
  if { [ "$MODE" = "incremental" ] || [ "$MODE" = "assets" ]; } && [ -n "$INCREMENTAL_CHANGES" ]; then
    # Purge selectivo — solo URLs cambiadas + sitemaps.
    INCREMENTAL_MODE="$MODE" \
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

# ─── 8. Auto-commit POST-build + guardar SHA ───────────────────────────────
# El build regenera artefactos (sitemaps, sw.js, search-index, índices...).
# Acá ya pasaron el smoke + purge → es exactamente lo que está live. Lo
# commiteamos para que el working tree quede SIEMPRE limpio post-deploy: nunca
# más se acumula la pila de "cambios sin commitear". Solo corre si el deploy
# fue sano (si el smoke falla, el script ya salió arriba → no commiteamos roto).
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  if git commit -q --no-verify -m "chore(deploy): artefactos build [auto]"; then
    ok "artefactos commiteados (auto) — working tree limpio"
  else
    warn "auto-commit post-build no hizo nada"
  fi
fi
echo "$(git rev-parse HEAD)" > .last-deploy-sha

# ─── Resumen ──────────────────────────────────────────────────────────────
T_TOTAL=$(($(date +%s) - T_START))
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOY OK${NC}  | mode: $MODE | total: ${T_TOTAL}s (build ${T_BUILD}s + deploy ${T_DEPLOY}s)"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo "Probar en https://hacecuentas.com"
