#!/usr/bin/env bash
# Refresca F1 2026 después de carreras, sprints y clasificaciones. Sólo hace
# deploy cuando el contenido cambió; el poll horario evita depender de un feed
# propietario o de horarios manuales que se desactualizan con el calendario.
set -uo pipefail

REPO="/Users/marrod/hacecuentas"
LOG="/tmp/hc-formula-1-refresh.log"
STATE="/tmp/hc-formula-1-2026.sig"
PLIST="$HOME/Library/LaunchAgents/com.hacecuentas.formula-1.plist"
SNAPSHOT="src/data/live/formula-1-2026.json"
export PATH="/usr/local/bin:/usr/bin:/bin"
export NODE_OPTIONS=--max-old-space-size=8192
cd "$REPO" || exit 1
log() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }

# La temporada termina en diciembre; no dejamos un job inútil corriendo en 2027.
if [ "$(date +%Y%m%d)" -gt "20261220" ]; then launchctl unload "$PLIST" 2>/dev/null || true; exit 0; fi
if pgrep -f 'deploy-local|astro build' >/dev/null 2>&1; then log 'build/deploy en curso → skip'; exit 0; fi

# Nunca desplegar WIP de otra sesión. El snapshot es el único cambio permitido
# antes de nuestro commit automático.
DIRTY=$(git status --porcelain | awk -v f="$SNAPSHOT" '$2 != f { print }')
if [ -n "$DIRTY" ]; then log 'working tree ajeno sucio → skip seguro'; exit 0; fi

if ! node scripts/fetch-formula-1-2026.mjs >> "$LOG" 2>&1; then
  log 'fetch OpenF1 falló'; git checkout -- "$SNAPSHOT" 2>/dev/null || true; exit 1
fi
SIG=$(node -e 'const j=require("./src/data/live/formula-1-2026.json"); delete j.fetchedAt; process.stdout.write(require("crypto").createHash("sha1").update(JSON.stringify(j)).digest("hex"))')
PREV=$(cat "$STATE" 2>/dev/null || true)
if [ -z "$SIG" ] || [ "$SIG" = "$PREV" ]; then
  log 'sin cambios reales'; git checkout -- "$SNAPSHOT" 2>/dev/null || true; exit 0
fi

git add "$SNAPSHOT"
git commit --no-verify -m 'data(f1): actualizar resultados y posiciones' >> "$LOG" 2>&1 || { log 'commit snapshot falló'; exit 1; }
if ! npm run deploy -- --force-full >> "$LOG" 2>&1; then log 'deploy falló; se reintentará'; exit 1; fi
sleep 5
bash scripts/cf-purge-cache.sh >> "$LOG" 2>&1
HTTP=$(curl -s -o /dev/null -w '%{http_code}' https://hacecuentas.com/formula-1-2026)
echo "$SIG" > "$STATE"
log "deploy OK; formula-1-2026=$HTTP"
