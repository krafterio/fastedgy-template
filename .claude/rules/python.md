# Python / FastAPI / Edgy conventions

## Project Facts
- FastEdgy product docs are exposed via an MCP server named "fastedgy-docs"
- Documentation covers FastAPI patterns, EdgyORM usage, dependency injection, and FastEdgy framework features
- Server code is structured under `server/` (`api/`, `models/`, `services/`, `schemas/`, `migrations/`, `queued_tasks/`, `scheduler/`, `signals/`); entry point `server/main.py`, CLI `kt` (run via `uv run kt`)
- Backend is i18n-aware: wrap user-facing strings (HTTPException details, emails) with `_t(...)`
- Service classes use short names — no "Service" suffix (e.g. `Stripe`, `IAP`, not `StripeService`)
- Backwards-compat: deployed mobile apps still call older API routes — never delete or rename a server endpoint without keeping a compat path

## Rules
1. Python target: 3.13. Use type hints everywhere. Use Pydantic for validation. Always use `uv run` to run command.
2. Services: Single-responsibility functions; dependency injection via FastAPI Depends; no global state
3. Edgy ORM: async session patterns; preload relations to avoid N+1; never write in GET handlers
   - Read attributes with `getattr(instance, "field", None)` — avoids lazy-load outside a transaction (`ObjectNotFound`)
   - Save: set the attribute then `await instance.save()` (no `instance.update()` — it doesn't exist)
   - Default DB isolation is SERIALIZABLE: handle `SerializationError` via retry — `@transaction` for pure-DB, `with_transaction()` when external I/O is involved
4. Errors: Raise HTTPException with a clear `detail` (i18n via `_t(...)` when user-facing); validate inputs with pydantic; log at error boundary
5. Tests: Pytest + anyio for async; one test module per feature; add a regression test for every bugfix. NOTE: no server test suite exists yet — set one up when adding the first test
6. Formatting: Ruff only — line-length 120 (`pyproject.toml`), no Black. Prefer self-explanatory type-hinted code over comments; no inline comments or boilerplate docstrings
7. Type-check: Pyright (`uv run pyright <file>`). After editing a `.py`, run it on the changed files and introduce **no new** errors — fix the ones in code you write. ~900 preexisting errors are mostly Edgy ORM dynamic-typing noise; do NOT attempt to zero out the whole project
8. FastEdgy integration (MCP-first):
   - When working with FastEdgy concepts (ORM Edgy, DI, API Routes Generator, Query Builder, Fields Selector, Metadata Generator, ORM Extensions, Database Migration, Queued Tasks, CLI, i18n, Multi Tenant, Email, Storage, Authentication, settings), MUST first call MCP **fastedgy-docs** → `searchMkDoc("keywords")`, then `fetchMkDoc(uri)` for the top result **before coding**
   - In PRs, reference the consulted doc section (file/heading or link)
   - DO NOT invent framework APIs. If missing in docs, propose a thin wrapper with clear TODO and link to the doc gap
