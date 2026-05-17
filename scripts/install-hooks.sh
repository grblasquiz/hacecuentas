#!/usr/bin/env bash
# Instala los hooks de git locales del repo.
#
# Uso: bash scripts/install-hooks.sh
#
# Los hooks viven en scripts/hooks/ y se linkean a .git/hooks/
# (los .git/hooks/ no se versionan, por eso necesitamos este install).

set -e
cd "$(git rev-parse --show-toplevel)"

mkdir -p .git/hooks

for hook in scripts/hooks/*; do
  name=$(basename "$hook")
  target=".git/hooks/$name"
  # Backup si ya existía
  if [ -f "$target" ] && [ ! -L "$target" ]; then
    cp "$target" "$target.backup-$(date +%Y%m%d-%H%M%S)"
  fi
  ln -sf "../../$hook" "$target"
  chmod +x "$hook"
  echo "✅ Instalado $name → $hook"
done

echo ""
echo "Hooks activos. Para saltarlos puntualmente:"
echo "  SKIP_HOOKS=1 git commit ..."
echo "  COMMIT_SKIP_RELATED=1 git commit ..."
echo "  COMMIT_SKIP_SCHEMA=1 git commit ..."
