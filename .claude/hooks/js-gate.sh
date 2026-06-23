#!/usr/bin/env bash
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" 2>/dev/null || exit 0
[ -f package.json ] || exit 0

out=$(npm run --silent lint 2>&1)
if [ $? -ne 0 ]; then
  {
    echo "oxlint signale des problèmes — corrige-les avant de t'arrêter :"
    echo "$out"
  } >&2
  exit 2
fi
exit 0
