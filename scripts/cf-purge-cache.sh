#!/usr/bin/env bash
# Purga TODO el cache de Cloudflare para hacecuentas.com
# Usage: bash scripts/cf-purge-cache.sh
#        npm run cf:purge

set -euo pipefail

# Cargar .env si existe
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

: "${CLOUDFLARE_API_TOKEN:?Falta CLOUDFLARE_API_TOKEN en .env}"
: "${CLOUDFLARE_ZONE_ID:?Falta CLOUDFLARE_ZONE_ID en .env}"

echo "🧹 Purgando cache de Cloudflare para hacecuentas.com..."

RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))")

if [ "$SUCCESS" = "True" ]; then
  echo "✅ Cache purgado exitosamente"
else
  echo "❌ Error al purgar cache:"
  echo "$RESPONSE" | python3 -m json.tool
  exit 1
fi
