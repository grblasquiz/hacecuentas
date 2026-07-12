#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Refresh del fixture del Mundial 2026 + deploy SOLO si cambió el resultado
# (goles/scores), para mantener frescos el SSR de goleadores/posiciones/fixture
# que ven los crawlers. Los usuarios ya ven datos live: la página refetchea
# openfootball client-side en cada carga (CSP permite raw.githubusercontent).
# Esto refresca el snapshot server-rendered después de cada partido.
#
# Patrón calcado de data-refresh-and-deploy.sh (guard anti-colisión, deploy solo
# si hay cambio REAL ignorando timestamps, --force-full, 2º purge, auto-commit).
# Corre por launchd (com.hacecuentas.mundial-fixture.plist) cada hora.
# Se auto-desactiva pasado el 20-jul-2026 (final del Mundial 19-jul).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

REPO="/Users/marrod/hacecuentas"
LOG="/tmp/hc-mundial-refresh.log"
STATE="/tmp/hc-mundial-fixture.sig"   # firma del último fixture deployado
PLIST="$HOME/Library/LaunchAgents/com.hacecuentas.mundial-fixture.plist"
export PATH="/usr/local/bin:/usr/bin:/bin"
export NODE_OPTIONS=--max-old-space-size=8192

cd "$REPO" || { echo "no pude cd a $REPO"; exit 1; }
ts() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(ts)] $*" >> "$LOG"; }

log "=== mundial-refresh start ==="

# 0) Torneo terminado (final 19-jul) → auto-desactivar el cron.
TODAY=$(date +%Y%m%d)
if [ "$TODAY" -gt "20260720" ]; then
  log "post 20-jul: torneo terminado → unload self"
  launchctl unload "$PLIST" 2>/dev/null || true
  exit 0
fi

# 1) No pisar un deploy/build en curso (data-refresh, discover-motor, sesión manual).
if pgrep -f "deploy-local|astro build" >/dev/null 2>&1; then
  log "deploy/build en curso → skip"; exit 0
fi

# 2) Fetch del fixture (openfootball).
if ! node scripts/fetch-mundial-fixture.mjs >> "$LOG" 2>&1; then
  log "fetch-mundial-fixture FALLÓ → no deploy"
  git checkout -- src/lib/data/mundial-2026-fixture.json 2>/dev/null || true
  exit 1
fi

# 3) ¿Cambió algo REAL? Firma = sha1 del JSON sin fetchedAt (ignora el sello de hora).
SIG=$(node -e 'const j=require("./src/lib/data/mundial-2026-fixture.json"); delete j.fetchedAt; process.stdout.write(require("crypto").createHash("sha1").update(JSON.stringify(j)).digest("hex"))' 2>>"$LOG")
if [ -z "$SIG" ]; then
  log "no pude computar firma → abortar sin deploy"
  git checkout -- src/lib/data/mundial-2026-fixture.json 2>/dev/null || true
  exit 1
fi
PREV=$(cat "$STATE" 2>/dev/null || echo "")
if [ "$SIG" = "$PREV" ]; then
  log "sin cambios reales (misma firma $SIG) → no deploy · descarto fetchedAt"
  git checkout -- src/lib/data/mundial-2026-fixture.json 2>/dev/null || true
  exit 0
fi

# 4) Cambió el fixture → deploy (force-full; auto-commitea el JSON).
log "fixture cambió ($PREV → $SIG) → deployando…"
npm run deploy -- --force-full --all >> "$LOG" 2>&1
rc=$?
if [ "$rc" != "0" ]; then
  log "deploy rc=$rc (FALLÓ) — la firma NO se guarda, se reintenta al próximo tick"
  exit "$rc"
fi

# 5) 2º purge CF (ritual) + verificación + persistir firma.
sleep 5
bash scripts/cf-purge-cache.sh >> "$LOG" 2>&1
chk=$(curl -s -o /dev/null -w '%{http_code}' https://hacecuentas.com/goleadores-mundial-2026)
echo "$SIG" > "$STATE"
log "deploy OK · 2º purge · goleadores=$chk · firma guardada === end ==="
