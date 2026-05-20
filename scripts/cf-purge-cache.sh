#!/usr/bin/env bash
# Purga cache de Cloudflare para hacecuentas.com.
#
# Usage:
#   bash scripts/cf-purge-cache.sh                          # purge_everything (default)
#   bash scripts/cf-purge-cache.sh --urls URL1 URL2 ...     # purge selectivo
#   bash scripts/cf-purge-cache.sh --urls-file file.txt     # URLs desde archivo (una por linea)
#
# La purga selectiva elimina el race condition window que la purga global
# tiene entre el storage perimetral y el flush por API. Recomendado para
# deploys de CTR rescue (titles/metas en URLs especificas) y casos donde
# solo cambian unas pocas paginas.

set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
fi

: "${CLOUDFLARE_API_TOKEN:?Falta CLOUDFLARE_API_TOKEN en .env}"
: "${CLOUDFLARE_ZONE_ID:?Falta CLOUDFLARE_ZONE_ID en .env}"

BASE_URL="https://hacecuentas.com"

# ---- Parse args ----
MODE="everything"
URLS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --urls)
      MODE="selective"
      shift
      while [ $# -gt 0 ] && [ "${1:0:2}" != "--" ]; do
        URLS+=("$1")
        shift
      done
      ;;
    --urls-file)
      MODE="selective"
      shift
      [ -f "$1" ] || { echo "❌ No existe archivo: $1" >&2; exit 1; }
      while IFS= read -r line; do
        line="${line%%#*}"  # quitar comments
        line="$(echo "$line" | xargs)"  # trim
        [ -z "$line" ] && continue
        URLS+=("$line")
      done < "$1"
      shift
      ;;
    -h|--help)
      sed -n '2,15p' "$0"; exit 0
      ;;
    *)
      echo "❌ Arg desconocido: $1" >&2
      exit 1
      ;;
  esac
done

# ---- Build payload ----
if [ "$MODE" = "everything" ]; then
  echo "🧹 Purgando TODO el cache de Cloudflare para hacecuentas.com..."
  PAYLOAD='{"purge_everything":true}'
else
  if [ ${#URLS[@]} -eq 0 ]; then
    echo "❌ --urls requiere al menos 1 URL" >&2
    exit 1
  fi
  # Normalizar: prepend https://hacecuentas.com si vienen como path
  FILES_JSON=""
  for u in "${URLS[@]}"; do
    if [[ "$u" == http* ]]; then
      full="$u"
    elif [[ "$u" == /* ]]; then
      full="${BASE_URL}${u}"
    else
      full="${BASE_URL}/${u}"
    fi
    [ -n "$FILES_JSON" ] && FILES_JSON+=","
    FILES_JSON+="\"$full\""
  done
  PAYLOAD="{\"files\":[${FILES_JSON}]}"
  echo "🎯 Purgando ${#URLS[@]} URL(s) selectivas:"
  for u in "${URLS[@]}"; do echo "    - $u"; done
fi

# ---- API call ----
RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "$PAYLOAD")

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))")

if [ "$SUCCESS" = "True" ]; then
  echo "✅ Cache purgado exitosamente"
else
  echo "❌ Error al purgar cache:"
  echo "$RESPONSE" | python3 -m json.tool
  exit 1
fi
