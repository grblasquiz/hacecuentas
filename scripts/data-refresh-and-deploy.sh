#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Refresh diario de datos live + deploy (LOCAL).
#
# Por qué local y no el workflow de GitHub Actions (data-refresh-daily.yml):
# origin y local divergieron fuerte (≈218 adelante / 59 atrás) y la regla es
# NO reconciliar. Las otras automatizaciones de esta máquina ya corren por
# launchd local (discover-motor, indexing-api). Esto sigue ese patrón.
#
# Flujo: fetch-all (BCRA/dólar AR/CL/CO/MX/PE) → sanity gate → deploy SOLO si
# cambió algún valor real (se ignoran timestamps → sin deploys cosméticos; los
# findes con mercados cerrados no disparan deploy). El deploy auto-commitea los
# JSON refrescados. Las páginas igual se mantienen vivas con el refresh
# client-side; esto refresca el snapshot server-rendered (lo que ven crawlers).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

REPO="/Users/marrod/hacecuentas"
LOG="/tmp/hc-data-refresh.log"
export PATH="/usr/local/bin:/usr/bin:/bin"
export NODE_OPTIONS=--max-old-space-size=8192

cd "$REPO" || { echo "no pude cd a $REPO"; exit 1; }
ts() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(ts)] $*" >> "$LOG"; }

log "=== data-refresh start ==="

# 0) No pisar un deploy/build en curso (discover-motor u otra rutina).
if pgrep -f "deploy-local|astro build" >/dev/null 2>&1; then
  log "deploy/build ya en curso → skip"; exit 0
fi

# 1) Fetch de todas las fuentes.
if ! node scripts/data-sources/fetch-all.mjs >> "$LOG" 2>&1; then
  log "fetch-all FALLÓ → no deploy"
  git checkout -- src/data/live/ public/datasets/ 2>/dev/null
  exit 1
fi

# 2) Sanity gate (valores, no solo frescura). exit 1=FAIL → no deploy; 2=WARN → seguir.
node --experimental-strip-types scripts/validate-data-sanity.ts --strict --cross-source --out=/tmp/hc-sanity.md >> "$LOG" 2>&1
code=$?
if [ "$code" = "1" ]; then
  log "SANITY FAIL → descarto datos y NO deployo (ver /tmp/hc-sanity.md)"
  git checkout -- src/data/live/ public/datasets/ 2>/dev/null
  exit 1
fi
[ "$code" = "2" ] && log "SANITY WARN (no bloqueante)"

# 2b) Fetchers periódicos (biannual/monthly/yearly) del pipeline update-data.
#     Viven acá porque sus workflows de GitHub Actions corren sobre origin/main
#     (forkeado, ≈1000 commits divergido) y sus PRs NO llegan al repo que
#     deploya. Gate por período con marker en ~/.hacecuentas-update-state:
#       · biannual (monotributo/ganancias/smvm): 15-ene / 15-jul en adelante
#       · monthly  (ipc/bcra/jubilacion-anses/ripte): día 16 en adelante
#       · yearly   (bienes-personales/costo-laboral/…): febrero
#     Son auto-llm (ANTHROPIC_API_KEY de .env) e idempotentes. Si un fetcher
#     falla, el marker NO se escribe → reintenta al día siguiente. Si algo
#     cambió, fuerza el deploy aunque los valores live no se hayan movido
#     (parchean src/lib/formulas/*, que el paso 3 no mira).
FORCE_DEPLOY=0
STATE_DIR="$HOME/.hacecuentas-update-state"
mkdir -p "$STATE_DIR"
if [ -z "${ANTHROPIC_API_KEY:-}" ] && [ -f "$REPO/.env" ]; then
  ANTHROPIC_API_KEY=$(grep -E '^ANTHROPIC_API_KEY=' "$REPO/.env" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
  export ANTHROPIC_API_KEY
fi
run_periodic() {
  freq="$1"; period="$2"; marker="$STATE_DIR/$freq"
  [ "$(cat "$marker" 2>/dev/null)" = "$period" ] && return 0
  log "update-data $freq (período $period)…"
  out=$(node --experimental-strip-types scripts/update-data/index.ts --frequency="$freq" 2>&1)
  echo "$out" >> "$LOG"
  summary=$(echo "$out" | grep -o 'SUMMARY::.*' | sed 's/SUMMARY:://')
  changed=$(echo "$summary" | grep -o '"changed":[0-9]*' | grep -o '[0-9]*$')
  errors=$(echo "$summary" | grep -o '"errors":[0-9]*' | grep -o '[0-9]*$')
  if [ -n "$summary" ] && [ "${errors:-1}" = "0" ]; then
    echo "$period" > "$marker"
    log "update-data $freq OK · changed=${changed:-0}"
  else
    log "update-data $freq con errores (errors=${errors:-?}) — reintenta mañana"
  fi
  if [ "${changed:-0}" -gt 0 ]; then FORCE_DEPLOY=1; fi
}
MES=$(date +%m); DIA=$(date +%d); ANIO=$(date +%Y)
if { [ "$MES" = "01" ] || [ "$MES" = "07" ]; } && [ "$DIA" -ge 15 ]; then
  if [ "$MES" = "01" ]; then H="H1"; else H="H2"; fi
  run_periodic biannual "$ANIO-$H"
fi
if [ "$DIA" -ge 16 ]; then run_periodic monthly "$ANIO-$MES"; fi
if [ "$MES" = "02" ]; then run_periodic yearly "$ANIO"; fi

# 3) ¿Cambió algún valor real? Se ignoran timestamps/metadatos (fetchedAt, fecha,
#    vigencia, source…) para no deployar cuando solo se movió un sello de hora.
#    FORCE_DEPLOY=1 (paso 2b) saltea este gate: los fetchers periódicos tocan
#    fórmulas/calcs que este diff no cubre.
REAL=$(git diff -- src/data/live/ public/datasets/ \
  | grep -E '^[+-]' \
  | grep -vE 'fetchedAt|lastUpdateApi|"fecha"|vigencia|"source"|sourceUrl|dateModified|"generatedAt"|@@|^\+\+\+|^---' \
  | grep -E '[0-9]')
if [ -z "$REAL" ] && [ "$FORCE_DEPLOY" = "0" ]; then
  log "sin cambios de valor real → no deploy (descarto timestamps)"
  git checkout -- src/data/live/ public/datasets/ 2>/dev/null
  exit 0
fi

# 3b) Bump de frescura para Bing. fetch-all (paso 1) refresca los valores live
#     pero NO toca `dataUpdate.lastUpdated` de las calcs — ese campo alimenta el
#     sitemap-fresh.xml que lee Bing. En GitHub Actions lo mantenía el pipeline
#     update-data, pero ese pipeline vive en el main remoto (forkeado, NO llega
#     a prod). Acá lo corremos LOCAL: parchea el fallback SSR de las fórmulas
#     (dólar) + toca lastUpdated en las calcs dólar/UVA/ICL/plazo-fijo. Corre
#     SOLO tras confirmar cambio de valor real (paso 3), así lastUpdated no se
#     mueve en días sin cambios (regla #3 SEO: no inflar el sitemap). Es
#     best-effort: si falla el fetch, se loguea y el deploy sigue igual.
#     Causa raíz del warning "feed was empty" en sitemap-fresh de Bing (jul-2026).
log "bump lastUpdated (update-data daily)…"
if node --experimental-strip-types scripts/update-data/index.ts --frequency=daily >> "$LOG" 2>&1; then
  log "lastUpdated bumpeado OK"
else
  log "update-data WARN (no bloqueante) — deploy sigue"
fi

# 4) Deploy (force-full; auto-commitea los JSON). Incremental rompe root-routes.
log "valores cambiaron → deployando…"
log "$(echo "$REAL" | grep -E '^[+]' | head -8 | tr '\n' ' ')"
npm run deploy -- --force-full >> "$LOG" 2>&1
rc=$?
if [ "$rc" != "0" ]; then
  log "deploy rc=$rc (FALLÓ) — revisar log"; exit "$rc"
fi

# 5) Segundo purge CF (ritual) + verificación de una página FX.
sleep 5
bash scripts/cf-purge-cache.sh >> "$LOG" 2>&1
chk=$(curl -s -o /dev/null -w '%{http_code}' https://hacecuentas.com/dolar-hoy-chile)
log "deploy OK · 2º purge hecho · dolar-hoy-chile=$chk === end ==="
