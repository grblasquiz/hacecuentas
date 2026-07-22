#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pasada MENSUAL de frescura para datos manuales (sin API): corre Claude Code
# headless con scripts/stale-sweep-prompt.md. Programada por launchd
# (com.hacecuentas.stale-sweep) el día 18 de cada mes (post-publicación de
# IPCs de mitad de mes). Gate por marker: si la Mac estaba apagada el 18,
# corre en el próximo intento del mes (launchd re-dispara al despertar).
# Log: /tmp/hc-stale-sweep.log · Reporte: /tmp/hc-stale-sweep-report.md
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail
REPO="/Users/marrod/hacecuentas"
LOG="/tmp/hc-stale-sweep.log"
STATE_DIR="$HOME/.local/state/hacecuentas"
MARKER="$STATE_DIR/stale-sweep-month"
export PATH="/usr/local/bin:/usr/bin:/bin"
ts() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(ts)] $*" >> "$LOG"; }

mkdir -p "$STATE_DIR"
MONTH=$(date +%Y-%m)
if [ -f "$MARKER" ] && [ "$(cat "$MARKER")" = "$MONTH" ]; then
  log "sweep $MONTH ya corrido → skip"; exit 0
fi

cd "$REPO" || { log "no pude cd a $REPO"; exit 1; }

# No pisar un deploy/build en curso.
if pgrep -f "deploy-local|astro build" >/dev/null 2>&1; then
  log "deploy/build en curso → reintento en próxima corrida"; exit 0
fi

# ¿Hay stale manuales? (barato; si no hay nada, ni invocamos a Claude)
COUNT=$(npx tsx scripts/check-stale-data.ts 2>/dev/null | grep -o 'STALE_SUMMARY::{"count":[0-9]*' | grep -o '[0-9]*$' || echo "?")
log "=== sweep $MONTH start · stale=$COUNT ==="
if [ "$COUNT" = "0" ]; then
  echo "$MONTH" > "$MARKER"; log "0 stale → nada que hacer"; exit 0
fi

# Claude Code headless. Auth: ANTHROPIC_API_KEY de .env (la sesión OAuth del
# CLI 2.1.76 está vencida — 401 el 7-22 — y el re-login es interactivo).
if [ -f "$REPO/.env" ]; then
  ANTHROPIC_API_KEY=$(grep -E '^ANTHROPIC_API_KEY=' "$REPO/.env" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
  export ANTHROPIC_API_KEY
fi
if claude -p "$(cat scripts/stale-sweep-prompt.md)" \
    --dangerously-skip-permissions \
    >> "$LOG" 2>&1; then
  echo "$MONTH" > "$MARKER"
  log "sweep OK (reporte en /tmp/hc-stale-sweep-report.md)"
else
  log "sweep FALLÓ (exit $?) → sin marker, reintenta en próxima corrida"
fi
log "=== sweep end ==="
