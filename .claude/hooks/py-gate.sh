#!/usr/bin/env bash
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" 2>/dev/null || exit 0
[ -f pyproject.toml ] || exit 0
. "$root/.claude/hooks/lib.sh"

if collect_changed '*.py'; then
  [ ${#CHANGED[@]} -gt 0 ] || exit 0
  out=$(uv run ruff check "${CHANGED[@]}" 2>&1)
else
  out=$(uv run ruff check 2>&1)
fi
st=$?

if [ $st -ne 0 ]; then
  {
    echo "ruff check signale des problèmes — corrige-les avant de t'arrêter :"
    echo "$out"
  } >&2
  exit 2
fi
exit 0
