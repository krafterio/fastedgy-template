# MCP usage rules for FastEdgy

## Project Facts
- The canonical product documentation is built with MkDocs and exposed via an MCP server registered in this workspace
- The Agent can use MCP tools: `searchMkDoc(query)`, `fetchMkDoc(uri)` from server "fastedgy-docs"
- Documentation covers both **Python** (FastAPI/EdgyORM/FastEdgy backend) and **JavaScript/Vue** (vue-fastedgy frontend) aspects

## Sources of truth (priority order)
1) Local OpenAPI spec (running dev server): `http://localhost:8000/openapi.json`
2) FastEdgy product docs via MCP server "fastedgy-docs" (MkDocs)
3) Existing service code and tests in this repo

## Mandatory preflight for any API change
1. MUST fetch and read the OpenAPI spec from the development server before adding/changing a request
2. MUST locate the **operation** by `operationId` or by (method + path)
3. MUST verify: path params, query params, request body schema, expected status codes, and response schema
4. If a mismatch is found between spec and current code:
   - Prefer aligning to the spec; if backend is the source of truth, open a TODO with the spec delta
5. PRs MUST include:
   - `operationId` (or method+path), the spec `info.version` (or last-modified), and links to the MkDocs page consulted via MCP

## Fallbacks
- If the OpenAPI spec is not reachable:
  - Start the dev server with `uv run kt serve`, then fetch `http://localhost:8000/openapi.json`
  - If it still can't be served, **stop** and request the spec export before coding endpoints

## Rules
1. WHEN a question concerns FastEdgy concepts (ORM Edgy, DI, API Routes Generator, Query Builder, Fields Selector, Metadata Generator, ORM Extensions, Database Migration, Queued Tasks, CLI, i18n, Multi Tenant, Email, Storage, Authentication, settings) OR vue-fastedgy features (fetcher, bus, composables):
   - MUST first call MCP `searchMkDoc` with 3–6 keywords (use "Vue.js [concept]" for vue-fastedgy features)
   - THEN call MCP `fetchMkDoc` on the top-1 relevant doc to confirm API/constraints before coding

2. MUST cite the doc section (file name or heading) you used to justify decisions in the code comment or PR message

3. DO NOT invent framework APIs. If missing in docs, propose a thin wrapper with clear TODO and link to the doc gap

4. When unsure between multiple patterns:
   - Prefer the documented examples from the MCP doc page over past code in the repo
