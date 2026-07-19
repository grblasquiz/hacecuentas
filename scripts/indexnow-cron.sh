#!/bin/bash
# IndexNow drip 2x/día — launchd: com.hacecuentas.indexnow-cron
#
# Envía a IndexNow (Bing/Yandex) SOLO las calcs cuyo JSON de contenido cambió
# desde el último envío. Es STREAMING, no batch: nunca reenvía el sitemap entero.
# Bing honra ~1700 submissions/mes para hacecuentas — reenviar las ~3100 del
# sitemap desaloja las URLs que sí cambiaron. Ver CLAUDE.md y memoria indexnow.
#
# Por qué LOCAL y no la GH Action: la Action corre en origin/main, pero el trabajo
# real vive en `main` local y casi nunca se pushea → las calcs nuevas de Martin
# nunca se avisaban. Esta rutina cubre ese gap.
#
# CATCH-UP HORARIO (2026-07-19): antes el LaunchAgent usaba StartCalendarInterval
# 09:00/21:00, pero launchd NO dispara con la Mac dormida y no recupera la corrida
# perdida → se saltaban runs en silencio (ej. 18-jul: solo corrió la de 21:00).
# Ahora el LaunchAgent tira StartInterval=1h y este script se auto-limita: corre
# de verdad solo si pasaron >=MIN_GAP_HOURS desde el último envío exitoso.
# Resultado: ~2 envíos/día garantizados apenas la Mac esté despierta en algún
# momento del día, sin depender de estar despierta a una hora exacta.
#
# Ventana: usa el HEAD del último envío exitoso (state file) → captura TODO lo
# commiteado desde entonces, sin importar cuántas horas durmió la Mac (el viejo
# window fijo de 13h perdía commits si el sueño superaba 13h). Fallback a 13h si
# no hay state válido (primera corrida). --max 40 sigue topando la quota Bing.
#
# Trade-off stateless→con-state aprobado por Martin (19-jul) a cambio de que no se
# saltee ninguna corrida. Ver memoria indexnow-rutina-local-2x-dia.
set -uo pipefail

REPO="/Users/marrod/hacecuentas"
PY="/Library/Frameworks/Python.framework/Versions/3.13/bin/python3"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/hacecuentas"
STATE_FILE="$STATE_DIR/indexnow-last-run"   # una línea: "<epoch> <sha_HEAD_enviado>"
MIN_GAP_HOURS=11                            # ~2 corridas/día; slack vs granularidad del tick
cd "$REPO" || { echo "❌ no pude cd a $REPO"; exit 1; }
mkdir -p "$STATE_DIR"

now="$(date +%s)"
last_epoch=0; last_sha=""
if [ -r "$STATE_FILE" ]; then
  read -r last_epoch last_sha < "$STATE_FILE" 2>/dev/null || true
fi
case "$last_epoch" in ''|*[!0-9]*) last_epoch=0 ;; esac

# --- Rate-gate: no-op SILENCIOSO si es muy pronto (no ensucia el log cada hora) ---
if [ "$last_epoch" -ne 0 ]; then
  gap_h=$(( (now - last_epoch) / 3600 ))
  if [ "$gap_h" -lt "$MIN_GAP_HOURS" ]; then
    exit 0
  fi
fi

echo "===== $(date '+%Y-%m-%d %H:%M:%S %z') IndexNow cron ====="

HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || true)"
[ -z "$HEAD_SHA" ] && { echo "❌ sin HEAD"; exit 1; }

# BEFORE = HEAD del último envío (si sigue siendo commit válido); si no, 13h atrás.
if [ -n "$last_sha" ] && git cat-file -e "${last_sha}^{commit}" 2>/dev/null; then
  BEFORE="$last_sha"
else
  BEFORE="$(git rev-list -1 --before='13 hours ago' HEAD 2>/dev/null || true)"
  [ -n "$BEFORE" ] && echo "(sin state válido → fallback ventana 13h)"
fi

if [ -z "$BEFORE" ] || [ "$BEFORE" = "$HEAD_SHA" ]; then
  echo "Sin commits nuevos desde el último envío — nada que enviar."
  printf '%s %s\n' "$now" "$HEAD_SHA" > "$STATE_FILE"   # marca el intento igual (respeta cadencia)
  exit 0
fi

echo "Ventana: ${BEFORE:0:8}..${HEAD_SHA:0:8}"
# --max 40: tope por corrida (protección quota Bing ~1700/mes). En días de campaña
# masiva el resto queda a merced del recrawl orgánico de Bing (por diseño).
if "$PY" scripts/indexnow-push.py --git-changed "$BEFORE" "$HEAD_SHA" --max 40; then
  printf '%s %s\n' "$now" "$HEAD_SHA" > "$STATE_FILE"
else
  rc=$?
  echo "⚠️ push falló (rc=$rc) — no actualizo state, se reintenta en la próxima hora."
fi
