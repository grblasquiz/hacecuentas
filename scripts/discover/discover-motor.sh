#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Motor Discover — runtime LOCAL (corre por launchd, 1×/día).
#
# Por qué local y no GitHub Actions: prod se actualiza por deploy local (wrangler)
# y el repo local diverge de origin/main (190↔59). Este wrapper esquiva eso:
# genera las piezas auto que toquen y deploya local SOLO si hay algo pendiente
# y el campo de deploy está libre (no colisiona con las routines).
#
# Cadencia auto cubierta:
#   - Inflación "cuánto perdiste": días 14-17 (INDEC publica IPC del mes anterior)
#   - Informe financiero mensual: 1er lunes
# Las piezas EDITORIALES (aguinaldo, monotributo, ganancias…) NO las genera esto:
# el due-checker (discover-due.py) avisa y se escriben a mano/agente.
#
# Idempotente: generate-inflacion-post.py hace skip-if-exists (no re-fecha).
# ─────────────────────────────────────────────────────────────────────────────
set -u
export PATH="/usr/local/bin:/Library/Frameworks/Python.framework/Versions/3.13/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_OPTIONS="--max-old-space-size=8192"

REPO="/Users/marrod/hacecuentas"
LOG="/tmp/hc-discover-motor.log"
LOCK="/tmp/hc-discover-motor.lock"
cd "$REPO" || exit 1
exec >>"$LOG" 2>&1

notify() { /usr/bin/osascript -e "display notification \"$1\" with title \"Motor Discover\"" 2>/dev/null; }

# No solaparse con otra corrida del motor
if [ -e "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  echo "=== $(date) ya hay una corrida activa, salgo ==="; exit 0
fi
echo $$ >"$LOCK"
trap 'rm -f "$LOCK"' EXIT

echo "=== $(date) motor run ==="
DOW=$(date +%u)                 # 1=lunes
DOM=$(( 10#$(date +%d) ))       # día del mes sin cero a la izquierda

# 1) Generar lo que toque (cada generador es idempotente)
if [ "$DOM" -ge 14 ] && [ "$DOM" -le 17 ]; then
  echo "→ ventana inflación AR"; python3 scripts/generate-inflacion-post.py || true
  echo "→ ventana IPCA BR";      python3 scripts/generate-ipca-post.py || true
fi
if [ "$DOW" -eq 1 ] && [ "$DOM" -le 7 ]; then
  echo "→ ventana informe financiero (1er lunes)"; python3 scripts/generate-monthly-post.py || true
fi
# Finde largo: auto-gateado (el script solo escribe si hay uno en los próximos ~7 días)
echo "→ check finde largo"; python3 scripts/generate-finde-largo-post.py || true
# Partidos del Mundial del finde: auto-gateado (solo jue-dom y dentro del Mundial 11-jun/19-jul)
echo "→ check mundial finde"; python3 scripts/generate-mundial-weekend-post.py || true
# Finde evergreen estacional: ángulo de fin de semana (cuando el orgánico cae ~48%).
# Auto-gateado y anti-thin: MÁX 1 post por semana ISO (skip-if-exists), rota entre 6
# temas distintos pegados al mes, y NO escribe si hay finde-largo cerca (±4d) o si
# estamos dentro del Mundial (eso lo cubre el generador de arriba).
echo "→ check finde (evergreen estacional)"; python3 scripts/generate-finde-post.py || true
# Dólar: newsjacking de calidad — el script SOLO escribe si el blue saltó ≥2,5%
# vs la última cotización (cooldown 2d) → cadencia en días de noticia, no thin.
echo "→ check dólar (newsjacking)"; python3 scripts/generate-dolar-post.py || true

# 2) ¿Hay notas de blog pendientes de publicar? (recién generadas o diferidas)
if ! git status --porcelain -- src/content/blog/ | grep -q .; then
  echo "nada pendiente en blog/, nada que hacer"
  # Alerta de cadencia: Discover premia el goteo CONSTANTE, y el motor auto solo
  # dispara en eventos de calendario (inflación, finde, mundial) → entre eventos
  # hay huecos. Si hace >3 días que no publicamos, avisamos para alimentar la capa
  # editorial (capa 2, a mano/agente). NO generamos relleno (sería thin-content).
  GAP=$(python3 -c "
import json, glob
from datetime import date
ds=[]
for f in glob.glob('src/content/blog/*.json'):
    try:
        j=json.load(open(f)); d=(j.get('date') or j.get('datePublished') or '')[:10]
        if d: ds.append(d)
    except Exception: pass
if ds:
    y,m,dd=map(int, max(ds).split('-')); print((date.today()-date(y,m,dd)).days)
else:
    print(999)
" 2>/dev/null)
  if [ "${GAP:-0}" -gt 3 ]; then
    echo "⚠ hace $GAP días sin publicar — Discover pierde ritmo. Toca una nota editorial (capa 2)."
    notify "Discover: hace $GAP días sin nota. Escribí una editorial."
    [ -f scripts/discover/discover-due.py ] && python3 scripts/discover/discover-due.py 2>/dev/null | head -8
  else
    echo "cadencia OK (última nota hace ${GAP:-?} días)"
  fi
  exit 0
fi
PEND=$(git status --porcelain -- src/content/blog/ | awk '{print $2}' | tr '\n' ' ')
echo "pendiente: $PEND"

# 3) Deploy SOLO si el campo está libre (no colisionar con routines)
BUSY=$(( $(pgrep -fc 'deploy-local.sh --force-full' 2>/dev/null || echo 0) + $(pgrep -fc 'node_modules/.bin/astro build' 2>/dev/null || echo 0) ))
if [ "$BUSY" -ne 0 ]; then
  echo "campo ocupado ($BUSY) → difiero el deploy (el post queda generado para la próxima corrida/routine)"
  notify "Nota Discover generada; deploy diferido (campo ocupado)"
  exit 0
fi

echo "campo libre → deploy full"
notify "Publicando nota Discover…"
rm -rf dist .wrangler/deploy 2>/dev/null
if npm run deploy -- --force-full; then
  echo "✅ deploy OK"; notify "Nota Discover publicada ✅"
  # ping de indexación fresh (best-effort, no rompe si falla)
  python3 scripts/indexnow-push.py 2>/dev/null || true
  python3 scripts/bing-news-submit.py 2>/dev/null || true
else
  echo "✗ deploy falló"; notify "Motor Discover: deploy FALLÓ, revisar log"
fi
