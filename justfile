# ==============================================================================
# Help
# ==============================================================================

# Show available commands
help:
    @just --list

# ==============================================================================
# Code quality
# ==============================================================================

# Format all code (Python, JS/Vue)
format:
    uv run ruff format
    npm run format

formatpy:
    uv run ruff format

formatjs:
    npm run format

# Lint all code (Python, JS/Vue)
lint:
    uv run ruff check
    npm run lint

lintpy:
    uv run ruff check

lintjs:
    npm run lint

# Check all code (Python)
check:
    uv run pyright

checkpy:
    uv run pyright

# Fix all code (Python, JS/Vue)
fix:
    uv run ruff check --fix
    npm run fix

fixpy:
    uv run ruff check --fix

fixjs:
    npm run fix

# FCL all code (Python, JS/Vue)
fcl:
    uv run ruff check --fix
    uv run ruff format
    npm run fix
    npm run format
    uv run pyright
    uv run ruff check
    npm run lint

# FCL Python code
fclpy:
    uv run ruff check --fix
    uv run ruff format
    uv run pyright
    uv run ruff check

# FCL JS/Vue code
fcljs:
    npm run fix
    npm run format
    npm run lint

# Test all code (Python, JS/Vue)
test:
    uv run pytest -n 4
    npm run test

testpy *args:
    uv run pytest {{args}}

testjs:
    npm run test

# ==============================================================================
# Profiling
# ==============================================================================

# Profile CPU + memory of a running `kt serve` (e.g. just profile-serve 37685)
# Includes child processes (uvicorn reload worker). Ctrl-C to stop. Outputs a
# timestamped log + plot. Pass an explicit PID, else auto-detects `kt serve`.
[no-exit-message]
profile-serve PID="":
    #!/usr/bin/env bash
    set -e
    PID="{{PID}}"
    if [ -z "$PID" ]; then
        PID=$(pgrep -f "kt serve" | head -1)
        if [ -z "$PID" ]; then
            echo "No 'kt serve' process found: start one with 'uv run kt serve', or pass a PID."
            exit 1
        fi
    fi
    TS=$(date +%Y%m%d-%H%M%S)
    LOG="serve_usage-$TS.log"
    PLOT="serve_usage-$TS.png"
    echo "Profiling PID $PID and its children into $LOG / $PLOT (Ctrl-C to stop)"
    uvx --from "psrecord[plot]" psrecord "$PID" \
        --include-children --interval 0.5 \
        --log "$LOG" --plot "$PLOT"
