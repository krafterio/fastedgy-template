#!/usr/bin/env bash
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" 2>/dev/null || exit 0
[ -f package.json ] || exit 0
. "$root/.claude/hooks/lib.sh"

oxlint="$root/node_modules/.bin/oxlint"
[ -x "$oxlint" ] || exit 0

if collect_changed '*.js' '*.jsx' '*.mjs' '*.cjs' '*.ts' '*.tsx' '*.vue'; then
  [ ${#CHANGED[@]} -gt 0 ] || exit 0
  out=$("$oxlint" --type-aware "${CHANGED[@]}" 2>&1)
else
  out=$(npm run --silent lint 2>&1)
fi
st=$?

if [ $st -ne 0 ]; then
  {
    echo "oxlint signale des problèmes — corrige-les avant de t'arrêter :"
    echo "$out"
  } >&2
  exit 2
fi
exit 0
