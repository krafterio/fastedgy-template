#!/usr/bin/env bash
set -uo pipefail

# Exit 2 blocks the stop and hands the problems to Claude. The stop that follows a block is let
# through, never looping, with exit 1: the user still sees what fails.
input=$(cat 2>/dev/null || true)
block=2
case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) block=1 ;; esac

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" 2>/dev/null || exit 0
[ -f package.json ] || exit 0
. "$root/.claude/hooks/lib.sh"

oxlint="$root/node_modules/.bin/oxlint"
[ -x "$oxlint" ] || exit 0

if collect_changed '*.js' '*.jsx' '*.mjs' '*.cjs' '*.ts' '*.tsx' '*.vue'; then
  [ ${#CHANGED[@]} -gt 0 ] || exit 0
  out=$("$oxlint" --type-aware --deny-warnings "${CHANGED[@]}" 2>&1)
else
  out=$(npm run --silent lint 2>&1)
fi
st=$?

if [ $st -ne 0 ]; then
  {
    echo "oxlint signale des problèmes, corrige-les avant de t'arrêter :"
    echo "$out"
  } >&2
  exit $block
fi
exit 0
