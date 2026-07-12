#!/usr/bin/env bash
#
# build-guard.sh — serializa CUALQUIER `npm run build` con los deploys.
#
# Por qué: dos `astro build` sobre el mismo dist/ corrompen el bundle (worker se
# infla a 81 MiB → Cloudflare lo rechaza con code 10027, pero el deploy imprimía
# "OK"). Pasaba cuando una sesión corría `npm run build` a mano mientras otra
# deployaba. Ahora TODO build pasa por acá y toma el MISMO lock que deploy-local.sh
# (.deploy.lock), así build y deploy son mutuamente exclusivos en toda la máquina.
#
# Reentrancia: deploy-local.sh ya tiene el lock y exporta HC_DEPLOY_LOCK_HELD=1 →
# acá NO re-lockeamos (correríamos build:raw directo). En CI tampoco hay deploys
# locales concurrentes → sin lock. Fail-open: si el lock se traba, buildeamos igual
# (nunca bloqueamos un build para siempre).
#
# El build real vive en el script `build:raw` de package.json. Este wrapper sólo
# agrega el lock. HC_BUILD_CMD permite override (para tests).
set -e

BUILD_CMD="${HC_BUILD_CMD:-npm run build:raw}"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
LOCKFILE="$REPO_ROOT/.deploy.lock"

# CI, o un deploy que ya tiene el lock → build directo sin tocar el lock.
if [ -n "${GITHUB_ACTIONS:-}" ] || [ -n "${CI:-}" ] || [ -n "${HC_DEPLOY_LOCK_HELD:-}" ]; then
  exec $BUILD_CMD
fi

# Lock propio (misma impl que deploy-local.sh: creación atómica con noclobber +
# reclamo si el holder murió vía kill -0; macOS no trae flock).
acquire() {
  ( set -o noclobber; echo "$$" > "$LOCKFILE" ) 2>/dev/null && return 0
  local h; h=$(cat "$LOCKFILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$h" ] && ! kill -0 "$h" 2>/dev/null; then
    rm -f "$LOCKFILE"
    ( set -o noclobber; echo "$$" > "$LOCKFILE" ) 2>/dev/null && return 0
  fi
  return 1
}

GOT_LOCK=0
if acquire; then
  GOT_LOCK=1
else
  W=0
  while true; do
    H=$(cat "$LOCKFILE" 2>/dev/null | tr -d '[:space:]')
    [ "$W" = 0 ] && echo "[build] deploy/build en curso (PID ${H:-?}) — espero turno para no pisar dist/..."
    [ "$W" -gt 0 ] && [ $((W % 60)) = 0 ] && echo "[build] ...sigo esperando el lock (${W}s · holder PID ${H:-?})"
    sleep 5; W=$((W + 5))
    if acquire; then GOT_LOCK=1; break; fi
    if [ "$W" -ge 1200 ]; then
      echo "[build] 20min esperando el lock — buildeo igual (fail-open) para no bloquearte. Holder PID ${H:-?}."
      break
    fi
  done
fi

if [ "$GOT_LOCK" = 1 ]; then
  trap 'rm -f "$LOCKFILE"' EXIT INT TERM
  echo "[build] lock adquirido (PID $$) — build serializado."
fi

# Corremos el build real. HC_DEPLOY_LOCK_HELD=1 por si algo anidara otro build.
HC_DEPLOY_LOCK_HELD=1 $BUILD_CMD
