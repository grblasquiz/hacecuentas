#!/usr/bin/env bash
# Post-deploy: pushea a IndexNow las URLs que cambiaron en el ultimo commit.
# Bing/Yandex/Naver reciben notification → re-crawl en horas (vs dias por
# crawl natural).
#
# Triggers:
#   - GH Actions Deploy to Cloudflare success (post-deploy step)
#   - npm run deploy:notify (manual)
#
# Detecta URLs modificadas via git diff HEAD~1 sobre JSONs de calcs
# + URLs despruneadas (entries removidas de pruning-redirects.ts).

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

[ -f .env ] && set -a && source .env && set +a

CHANGED_JSONS=$(git diff HEAD~1 HEAD --name-only --diff-filter=AMR -- 'src/content/calcs/*.json' 'src/content/calcs-*/*.json' 2>/dev/null || true)

if [ -z "$CHANGED_JSONS" ]; then
  echo "[post-deploy-indexnow] No calcs JSON changed in last commit — skip."
  exit 0
fi

DEPRUNED_URLS=$(git diff HEAD~1 HEAD --unified=0 -- src/lib/pruning-redirects.ts 2>/dev/null | grep -oE "^-\s+'(/[^']+)'" | sed -E "s/^-[[:space:]]+'(\\/[^']+)'.*/\\1/" || true)

URLS_FILE=$(mktemp)
echo "$CHANGED_JSONS" | while read -r f; do
  [ -z "$f" ] && continue
  [ ! -f "$f" ] && continue
  slug=$(python3 -c "import json; d=json.load(open('$f')); print(d.get('slug','') if not d.get('noindex') else '')" 2>/dev/null || true)
  [ -z "$slug" ] && continue
  case "$f" in
    src/content/calcs-en/*) echo "/en/$slug" >> "$URLS_FILE" ;;
    src/content/calcs-pt/*) echo "/pt/$slug" >> "$URLS_FILE" ;;
    src/content/calcs-mx/*) echo "/mx/$slug" >> "$URLS_FILE" ;;
    src/content/calcs-es/*) echo "/es/$slug" >> "$URLS_FILE" ;;
    src/content/calcs-co/*) echo "/co/$slug" >> "$URLS_FILE" ;;
    src/content/calcs-cl/*) echo "/cl/$slug" >> "$URLS_FILE" ;;
    src/content/calcs/*)   echo "/$slug" >> "$URLS_FILE" ;;
  esac
done

[ -n "$DEPRUNED_URLS" ] && echo "$DEPRUNED_URLS" >> "$URLS_FILE"

sort -u "$URLS_FILE" -o "$URLS_FILE"
TOTAL=$(wc -l < "$URLS_FILE" | tr -d ' ')

if [ "$TOTAL" -eq 0 ]; then
  echo "[post-deploy-indexnow] 0 URLs to push — skip."
  rm -f "$URLS_FILE"
  exit 0
fi

echo "[post-deploy-indexnow] Pushing $TOTAL URLs to IndexNow (Bing/Yandex)..."

URLS_FILE="$URLS_FILE" python3 <<'PYEOF'
import os, ssl, json, urllib.request, urllib.error
try:
    import certifi
    ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    ctx = ssl.create_default_context()

KEY = '00e48c587b06495db41032c4797d9d39'
HOST = 'hacecuentas.com'
ENDPOINT = 'https://api.indexnow.org/IndexNow'

with open(os.environ['URLS_FILE']) as f:
    urls = [line.strip() for line in f if line.strip()]

for i in range(0, len(urls), 10000):
    chunk = urls[i:i+10000]
    payload = {
        'host': HOST,
        'key': KEY,
        'keyLocation': f'https://{HOST}/{KEY}.txt',
        'urlList': [f'https://{HOST}{u}' for u in chunk],
    }
    req = urllib.request.Request(
        ENDPOINT, method='POST',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'},
    )
    try:
        r = urllib.request.urlopen(req, context=ctx, timeout=60)
        print(f'  IndexNow chunk {i//10000+1}: HTTP {r.status} ({len(chunk)} URLs)')
    except urllib.error.HTTPError as e:
        print(f'  IndexNow chunk {i//10000+1}: HTTP {e.code}')
    except Exception as e:
        print(f'  IndexNow chunk {i//10000+1}: error {e}')
PYEOF

rm -f "$URLS_FILE"
echo "[post-deploy-indexnow] Done."
