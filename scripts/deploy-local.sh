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

# ─── Helpers de concurrencia (lock single-flight + timeout portable) ───────
# macOS no trae flock(1) ni timeout(1), y shlock NO reclama locks stale. Así que
# rodamos nuestro propio lock: creación atómica con noclobber + chequeo de vida
# por kill -0 (reclama el lock si el holder murió, p.ej. kill -9 a un deploy).
acquire_deploy_lock() {   # $1=lockfile · rc 0=adquirido · rc 1=ocupado por proceso VIVO
  local lf="$1" holder
  if ( set -o noclobber; echo "$$" > "$lf" ) 2>/dev/null; then return 0; fi
  holder=$(cat "$lf" 2>/dev/null | tr -d '[:space:]')
  # Sólo reclamamos si el holder es un PID real y está MUERTO. Pidfile vacío =
  # recién creado por otra sesión → lo tratamos como vivo y reintentamos.
  if [ -n "$holder" ] && ! kill -0 "$holder" 2>/dev/null; then
    rm -f "$lf"
    ( set -o noclobber; echo "$$" > "$lf" ) 2>/dev/null && return 0
  fi
  return 1
}

# Corre un comando con timeout duro. rc 137/143 = fue matado por el timeout.
run_with_timeout() {   # $1=segundos · resto=comando…
  local secs=$1; shift
  "$@" & local pid=$!
  ( sleep "$secs"; kill -0 "$pid" 2>/dev/null && { kill -TERM "$pid" 2>/dev/null; sleep 3; kill -KILL "$pid" 2>/dev/null; } ) >/dev/null 2>&1 & local watcher=$!
  local rc=0; wait "$pid" || rc=$?
  kill "$watcher" 2>/dev/null || true; wait "$watcher" 2>/dev/null || true
  return $rc
}

# Igual que run_with_timeout pero mata el GRUPO de procesos entero (npm → astro
# → node hijos). Sin esto, matar solo npm deja un `astro build` HUÉRFANO que
# cuelga el próximo build ~1h (incidente 2026-07: deploy de 1h30 sin salida).
run_with_timeout_grp() {   # $1=segundos · resto=comando…
  local secs=$1; shift
  perl -e 'setpgrp(0,0); exec @ARGV or die "exec: $!"' -- "$@" & local pid=$!
  ( sleep "$secs"; kill -0 "$pid" 2>/dev/null && { kill -TERM -- -"$pid" 2>/dev/null; sleep 5; kill -KILL -- -"$pid" 2>/dev/null; } ) >/dev/null 2>&1 & local watcher=$!
  local rc=0; wait "$pid" || rc=$?
  kill "$watcher" 2>/dev/null || true; wait "$watcher" 2>/dev/null || true
  return $rc
}

# Parse args
PURGE=true
SMOKE=true
FORCE_FULL=false
COMMIT_ALL=false
for arg in "$@"; do
  case "$arg" in
    --no-purge)   PURGE=false ;;
    --no-smoke)   SMOKE=false ;;
    --force-full) FORCE_FULL=true ;;
    --all)        COMMIT_ALL=true ;;
  esac
done

T_START=$(date +%s)

# ─── 0. Log persistente + aviso de contención ─────────────────────────────
# Cada deploy deja un log completo en disco para poder autopsiar fallos
# (antes el output moría con la sesión y "tardó 1h30 y falló" era inauditable).
DEPLOY_LOG_DIR="$HOME/.local/state/hacecuentas/deploy-logs"
mkdir -p "$DEPLOY_LOG_DIR"
DEPLOY_RUN_LOG="$DEPLOY_LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S)-$$.log"
exec > >(tee -a "$DEPLOY_RUN_LOG") 2>&1
log "log de este deploy: $DEPLOY_RUN_LOG"
ls -t "$DEPLOY_LOG_DIR"/deploy-*.log 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true

# Si OTRO proceso (otra sesión Claude, Codex, cron) ya está corriendo un astro
# build en esta Mac, este build va a competir por CPU/RAM y puede tardar MUCHO.
OTHER_BUILDS=$(pgrep -f 'astro build' | wc -l | tr -d ' ')
if [ "$OTHER_BUILDS" -gt 0 ]; then
  warn "hay $OTHER_BUILDS proceso(s) 'astro build' de OTRA sesión corriendo — contención de CPU/RAM, este deploy va a tardar más."
  pgrep -fl 'astro build' | head -3 || true
fi

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

# ─── 1a. Guards pre-build (fail-fast en 1s vs fallar tras un build de 5min) ──
# LECCIÓN 2026-07-11: dos cosas rompieron el deploy DESPUÉS de un build full:
#   1) Un prune batch grande metió public/_redirects >2000 reglas → wrangler
#      falla con error 100324 (límite duro de Cloudflare Pages = 2000). Los
#      pruning redirects van por el WORKER (pruning-redirects.ts inlined en
#      wrapper.mjs), NO por _redirects → el archivo NO debe pasar de 2000.
#   2) Una sesión concurrente dejó src/middleware.ts corrupto (volcado de
#      git-log de 6MB) + un stray src/pages/middleware.ts con imports rotos.
# Ambos son detectables ACÁ en 1s, antes de gastar el build.
REDIR_RULES=$(grep -cE '^/' public/_redirects 2>/dev/null || echo 0)
if [ "$REDIR_RULES" -ge 1990 ]; then
  err "public/_redirects tiene $REDIR_RULES reglas — límite duro de Cloudflare = 2000."
  err "Los pruning redirects van por el worker (pruning-redirects.ts), NO por _redirects."
  err "Sacá el batch grande de public/_redirects; el worker igual los sirve (301/410)."
  exit 1
fi
if head -c 32 src/middleware.ts 2>/dev/null | grep -q '^commit '; then
  err "src/middleware.ts está corrupto (arranca con 'commit ' = volcado de git-log)."
  err "Restaurá: git show <último-commit-sano>:src/middleware.ts > src/middleware.ts"
  exit 1
fi
if [ -f src/pages/middleware.ts ]; then
  err "src/pages/middleware.ts existe (stray, imports rotos). El middleware real es"
  err "src/middleware.ts. Borralo: rm src/pages/middleware.ts"
  exit 1
fi
ok "guards pre-build OK | _redirects=$REDIR_RULES reglas (<2000), middleware sano"

# ─── 1b. Auto-commit PRE-build ─────────────────────────────────────────────
# detect-changes (abajo) diffea last-deploy-sha...HEAD → SOLO commits, no el
# working tree. Si el laburo queda sin commitear, HEAD==last-deploy-sha → fuerza
# FULL build siempre (lento + OOM) y la pila de "cambios sin commitear" se
# acumula y reaparece en cada deploy. Commiteando ANTES del detect, el trabajo
# entra como diff → incremental funciona y el árbol no acumula nada.
# REGLA multi-sesión: "commiteado = listo para deploy; sin commitear = WIP, no se
# toca". ANTES `git add -A` barría el trabajo a-medio-hacer de OTRAS sesiones
# (todas comparten este working tree) → deploys prematuros + commits ajenos.
# AHORA commiteamos SOLO lo que VOS stageaste; lo no-commiteado se lista pero NO
# se deploya. Escape hatch `--all` = viejo git add -A (SOLO si sos la única
# sesión: crons de datos, o Martin a mano sabiendo que no hay otras sesiones).
if [ "$COMMIT_ALL" = true ]; then
  if [ -n "$(git status --porcelain)" ]; then
    log "commit pre-build (--all): incluyo TODO el working tree..."
    git add -A
    if git commit -q --no-verify -m "chore(deploy): cambios pre-build [auto]"; then
      CURRENT_SHA=$(git rev-parse HEAD)
      ok "commiteado TODO pre-build → ${CURRENT_SHA:0:8}"
    else
      warn "commit pre-build (--all) no hizo nada"
    fi
  fi
else
  STAGED_FILES=$(git diff --cached --name-only)
  if [ -n "$STAGED_FILES" ]; then
    N_STAGED=$(printf '%s\n' "$STAGED_FILES" | grep -c .)
    log "commit pre-build de TUS $N_STAGED archivo(s) stageado(s)..."
    if git commit -q --no-verify -m "chore(deploy): cambios pre-build [auto]"; then
      CURRENT_SHA=$(git rev-parse HEAD)
      ok "commiteado (stageado) → ${CURRENT_SHA:0:8}"
    else
      warn "commit pre-build no hizo nada"
    fi
  fi
  # Lo que quede sin commitear NO se deploya. Lo avisamos FUERTE — nunca silencioso
  # (para que no pase "creí que deployó y no deployó").
  UNCOMMITTED=$( { git diff --name-only; git ls-files --others --exclude-standard; } | sort -u )
  if [ -n "$UNCOMMITTED" ]; then
    N_UNC=$(printf '%s\n' "$UNCOMMITTED" | grep -c .)
    warn "$N_UNC archivo(s) SIN commitear — NO se deployan (WIP tuyo o de otra sesión):"
    printf '%s\n' "$UNCOMMITTED" | head -10 | sed 's/^/      · /'
    [ "$N_UNC" -gt 10 ] && echo "      … y $((N_UNC - 10)) más"
    warn "Si son TUYOS y están listos:  git add <archivos>  y redeployá   ·   o forzá todo: npm run deploy -- --all"
  fi
fi

# ─── 1c. Lock de deploy — single-flight entre sesiones ─────────────────────
# Martin corre varias sesiones a la vez; antes N deploys concurrentes se pisaban:
# dos `astro build` sobre el mismo dist/ corrompían el bundle (worker 81 MiB → CF
# 10027, pero imprimía "OK") y el wrangler de uno se colgaba horas por contención
# en .wrangler/. Como el target es UN solo Worker, "multi-deploy" no existe:
# serializamos. El auto-commit de arriba ya dejó MI trabajo en HEAD, así que el
# deploy que corra (el mío o el del holder actual) lo incluye vía detect-changes
# (diff last-deploy-sha...HEAD). Si otro tiene el lock, ESPERO turno; cuando lo
# tomo, detect ve el last-deploy-sha ya avanzado → si mi commit ya salió live,
# SKIP en ~1s. Un solo build sirve a todas las sesiones encoladas.
LOCKFILE="$REPO_ROOT/.deploy.lock"
WRANGLER_TIMEOUT="${WRANGLER_TIMEOUT:-420}"   # matar wrangler si cuelga
LOCK_WAIT=0
while ! acquire_deploy_lock "$LOCKFILE"; do
  HOLDER=$(cat "$LOCKFILE" 2>/dev/null | tr -d '[:space:]')
  [ "$LOCK_WAIT" = 0 ] && log "otro deploy en curso (PID ${HOLDER:-?}) — espero turno; tu commit ${CURRENT_SHA:0:8} ya está en HEAD y saldrá live."
  [ "$LOCK_WAIT" -gt 0 ] && [ $((LOCK_WAIT % 60)) = 0 ] && log "...sigo esperando el lock (${LOCK_WAIT}s · holder PID ${HOLDER:-?})"
  sleep 5; LOCK_WAIT=$((LOCK_WAIT + 5))
  if [ "$LOCK_WAIT" -ge 1200 ]; then
    err "esperé 20min por el lock (holder PID ${HOLDER:-?}) y sigue tomado. Abortando sin tocar nada."
    err "Si ese PID está colgado:  kill -9 ${HOLDER:-<pid>} ; rm -f $LOCKFILE ; y reintentá el deploy."
    exit 1
  fi
done
# Desde acá tengo el lock. Liberarlo en CUALQUIER salida (incluí set -e / exit N).
trap 'rm -f "$LOCKFILE"' EXIT INT TERM
# El `npm run build` interno pasa por build-guard.sh; le decimos que YA tenemos el
# lock para que no intente re-adquirirlo (deadlock) — corre el build directo.
export HC_DEPLOY_LOCK_HELD=1
if [ "$LOCK_WAIT" -gt 0 ]; then
  ok "lock de deploy adquirido tras ${LOCK_WAIT}s de espera (PID $$)"
else
  ok "lock de deploy adquirido (PID $$)"
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
    elif echo "$DETECT_OUT" | grep -q "^mode=fast"; then
      MODE=fast
      REASON=$(echo "$DETECT_OUT" | grep "^reason=" | sed 's/^reason=//')
      ok "modo FAST PAGE — $REASON"
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
if [ "$MODE" = "fast" ]; then
  # Sin Astro: assets HTML + wrapper delta + purge + smoke. El lock ya está
  # tomado por este script, por eso se lo informamos al subcomando.
  HC_DEPLOY_LOCK_HELD=1 bash scripts/deploy-fast-page.sh
  exit 0
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
  BUILD_TIMEOUT="${BUILD_TIMEOUT:-900}"
  log "build INCREMENTAL (estimado ~60-90s · timeout duro ${BUILD_TIMEOUT}s)..."
  # NO limpiamos dist — emptyOutDir:false en astro.config.mjs preserva los
  # HTMLs cacheados; Astro solo regenera los slugs cambiados.
  export INCREMENTAL_CHANGES
  BUILD_LOG=$(mktemp -t hc-build.XXXXXX); BUILD_RC=0
  run_with_timeout_grp "$BUILD_TIMEOUT" npm run build >"$BUILD_LOG" 2>&1 || BUILD_RC=$?
  grep -E "(\[(prebuild|incremental|build|vite|wrap-worker|strip-pruned|optimize-css)\]|Server built|Completed in|✓ built in|EXIT|Files processed)" "$BUILD_LOG" | tail -25
else
  BUILD_TIMEOUT="${BUILD_TIMEOUT:-1800}"
  log "build FULL (estimado ~3-5min · timeout duro ${BUILD_TIMEOUT}s)..."
  rm -rf dist
  unset INCREMENTAL_CHANGES
  BUILD_LOG=$(mktemp -t hc-build.XXXXXX); BUILD_RC=0
  run_with_timeout_grp "$BUILD_TIMEOUT" npm run build >"$BUILD_LOG" 2>&1 || BUILD_RC=$?
  grep -E "(\[(prebuild|build|vite|wrap-worker|strip-pruned|optimize-css)\]|Server built|Completed in|✓ built in|EXIT|Files processed)" "$BUILD_LOG" | tail -20
fi
if [ "${BUILD_RC:-0}" = 137 ] || [ "${BUILD_RC:-0}" = 143 ]; then
  err "build EXCEDIÓ el timeout de ${BUILD_TIMEOUT}s y fue matado (grupo entero, sin huérfanos)."
  err "Causas típicas: otro astro build en paralelo (Codex/otra sesión), OOM-thrash, huérfano previo."
  err "Log completo: $BUILD_LOG · reintentá con: BUILD_TIMEOUT=3600 npm run deploy"
  exit 1
elif [ "${BUILD_RC:-0}" != 0 ]; then
  err "build FALLÓ (rc=$BUILD_RC). Últimas líneas:"
  tail -20 "$BUILD_LOG"
  err "Log completo: $BUILD_LOG"
  exit 1
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
# Con timeout duro: si wrangler cuelga (contención/red/CF API), lo matamos y
# fallamos limpio en vez de colgar horas (incidente 2026-06-23: 3h35m a 0% CPU).
# El lock se libera al salir → la próxima sesión puede deployar.
DEPLOY_LOG=$(mktemp -t hc-wrangler.XXXXXX)
DEPLOY_RC=0
run_with_timeout "$WRANGLER_TIMEOUT" npx wrangler@latest deploy >"$DEPLOY_LOG" 2>&1 || DEPLOY_RC=$?
DEPLOY_OUT=$(cat "$DEPLOY_LOG"); rm -f "$DEPLOY_LOG"
echo "$DEPLOY_OUT" | grep -E "(Uploaded.*assets|Success|Total Upload|Worker Startup|Current Version|error|Error)" | head -10
if [ "$DEPLOY_RC" -eq 137 ] || [ "$DEPLOY_RC" -eq 143 ]; then
  cd "$REPO_ROOT"
  err "wrangler EXCEDIÓ el timeout de ${WRANGLER_TIMEOUT}s y fue matado (deploy colgado). NO está en vivo — reintentá."
  exit 1
fi
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
# SOLO los artefactos (no `git add -A` → no barrer WIP de otras sesiones). El WIP
# sin commitear queda intacto en el working tree.
ART_PATTERN='sitemap|search-index|sw\.js|og-manifest|related-auto|db/sitemap-state|calcs-index'
{ git diff --name-only; git ls-files --others --exclude-standard; } \
  | grep -E "$ART_PATTERN" \
  | while IFS= read -r f; do [ -n "$f" ] && git add -- "$f"; done
if [ -n "$(git diff --cached --name-only)" ]; then
  if git commit -q --no-verify -m "chore(deploy): artefactos build [auto]"; then
    ok "artefactos build commiteados (auto)"
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
