#!/usr/bin/env bash

collect_changed() {
  CHANGED=()
  local root="${CLAUDE_PROJECT_DIR:-$PWD}"
  git -C "$root" rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 1
  local f p
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    for p in "$@"; do
      case "$f" in
        $p)
          [ -f "$root/$f" ] && CHANGED+=("$root/$f")
          break
          ;;
      esac
    done
  done < <(
    {
      git -C "$root" diff --name-only
      git -C "$root" ls-files --others --exclude-standard
    } 2>/dev/null | sort -u
  )
  return 0
}
