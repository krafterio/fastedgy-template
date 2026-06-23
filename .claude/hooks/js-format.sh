#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit)
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" \
  | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' \
  | head -1 \
  | sed -E 's/.*:[[:space:]]*"([^"]+)"/\1/')

[ -n "${file:-}" ] || exit 0
case "$file" in
  *.js|*.jsx|*.mjs|*.cjs|*.ts|*.tsx|*.vue) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
fmt="$root/node_modules/.bin/oxfmt"
[ -x "$fmt" ] && "$fmt" --write "$file" >/dev/null 2>&1 || true
exit 0
