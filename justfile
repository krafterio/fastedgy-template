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
    npm run fix
    uv run pyright
    uv run ruff check
    npm run lint

# FCL Python code
fclpy:
    uv run ruff check --fix
    uv run pyright
    uv run ruff check

# FCL JS/Vue code
fcljs:
    npm run fix
    npm run lint

# Test all code (Python, JS/Vue)
test:
    uv run pytest
    npm run test

testpy:
    uv run pytest

testjs:
    npm run test
