#!/usr/bin/env bash
set -uo pipefail

# Exit 2 blocks the stop and hands the problems to Claude. The stop that follows a block is let
# through, never looping, with exit 1: the user still sees what fails.
input=$(cat 2>/dev/null || true)
block=2
case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) block=1 ;; esac

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" 2>/dev/null || exit 0
[ -f pyproject.toml ] || exit 0
. "$root/.claude/hooks/lib.sh"

if collect_changed '*.py'; then
  [ ${#CHANGED[@]} -gt 0 ] || exit 0
  out=$(uv run ruff check "${CHANGED[@]}" 2>&1)
  st=$?
  if [ $st -eq 0 ]; then
    out=$(uv run pyright "${CHANGED[@]}" 2>&1)
    st=$?
  fi
else
  out=$(uv run ruff check 2>&1)
  st=$?
  if [ $st -eq 0 ]; then
    out=$(uv run pyright 2>&1)
    st=$?
  fi
fi

if [ $st -ne 0 ]; then
  {
    echo "ruff ou pyright signale des problèmes, corrige-les avant de t'arrêter :"
    echo "$out"
  } >&2
  exit $block
fi
exit 0
