---
description: Auto-fix all three stacks (Python, JS/Vue) then resolve the rest
allowed-tools: Bash(uv run ruff check:*), Bash(uv run ruff format:*), Bash(npm run fix:*), Bash(npm run format:*), Bash(npm run lint:*)
---
Auto-fix every stack, then fix what remains by hand.

Python:  `uv run ruff check --fix` && `uv run ruff format`
JS/Vue:  `npm run fix` && `npm run format`

Then run the lint of each stack (`uv run ruff check`,
`npm run lint`) and manually fix anything that could not be auto-fixed.
Finish with a short summary per stack: auto-fixed vs. fixed by hand vs. still failing.
