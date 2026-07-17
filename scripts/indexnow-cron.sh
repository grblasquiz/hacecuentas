#!/bin/bash
# IndexNow drip 2x/día — launchd: com.hacecuentas.indexnow-cron
#
# Envía a IndexNow (Bing/Yandex) SOLO las calcs cuyo JSON de contenido cambió en
# las últimas ~13h. Es STREAMING, no batch: nunca reenvía el sitemap entero. Bing
# honra ~1700 submissions/mes para hacecuentas — reenviar las ~3100 del sitemap
# desaloja las URLs que sí cambiaron. Ver CLAUDE.md y memoria indexnow-batch-a-streaming.
#
# Por qué LOCAL y no la GH Action: la Action de IndexNow corre en origin/main, pero
# el trabajo real vive en `main` local y casi nunca se pushea a origin → las calcs
# nuevas de Martin nunca se avisaban. Esta rutina cubre ese gap.
#
# Stateless: la ventana temporal (13h) se solapa ~1h con la corrida anterior
# (cadencia 12h: 09:00 y 21:00) → sin gaps y sin state-file que se pierda en reboot.
set -uo pipefail

REPO="/Users/marrod/hacecuentas"
PY="/Library/Frameworks/Python.framework/Versions/3.13/bin/python3"
cd "$REPO" || { echo "❌ no pude cd a $REPO"; exit 1; }

echo "===== $(date '+%Y-%m-%d %H:%M:%S %z') IndexNow cron ====="

# Commit más nuevo con >=13h de antigüedad = base de la ventana.
# BEFORE..HEAD = todo lo commiteado en las últimas ~13h.
BEFORE="$(git rev-list -1 --before='13 hours ago' HEAD 2>/dev/null || true)"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || true)"

if [ -z "$BEFORE" ] || [ -z "$HEAD_SHA" ] || [ "$BEFORE" = "$HEAD_SHA" ]; then
  echo "Sin commits en las últimas ~13h — nada que enviar."
  exit 0
fi

echo "Ventana: ${BEFORE:0:8}..${HEAD_SHA:0:8}"
# --max 40: tope por corrida. 40 × 2/día × 30 = 2400/mes techo teórico, pero los
# días normales mandan <10 → el mes queda holgado bajo la quota ~1700. En días de
# campaña masiva el tope evita quemar meses de presupuesto de una (ver indexnow-push.py).
"$PY" scripts/indexnow-push.py --git-changed "$BEFORE" "$HEAD_SHA" --max 40
