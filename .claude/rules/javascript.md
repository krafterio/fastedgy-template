# JavaScript rules (Fastedgy API client via fetcher)

## Project Facts
- The web app lives in `web/src/`, split into area modules: `console/`, `common/`, `main/`. Each area holds its own `components/`, `composables/`, `stores/`, `views/`
- Model routes go through **api models**: one file per model in `common/composables/api/<model>.js`, wrapping `useApiModel()` from `vue-fastedgy`. They describe a server model, not a screen, so they live in `common/` whichever area consumes them. A route that answers to no model gets its own api composable, named after what it serves (`useAuthApi`, `useConsoleInfoApi`), in `<area>/composables/api/` when the endpoints belong to that surface, in `common/` when more than one can read them
- The surface an SPA speaks to is wired once, at its entry point: `createFetcher({ surface: 'app' })` in `main/main.js`, `createFetcher({ surface: 'console' })` in `console/main.js`. Everything else writes `/{app}/…` and the fetcher resolves the placeholder, so the same api model serves both SPAs
- Lists are held by **`useDataIterator`** from `vue-fastedgy` (with `useDataTable` and `useDataGrid` over it): server-side pagination, `X-Fields`, `X-Filter`, ordering, selection, export/import. `DataTable` and `DataGrid`, the components that dress them, stay in `web/src/common/components/ui/`
- A shared **fetcher** (from `vue-fastedgy`) wraps the Fetch API. Access it via the composables `useFetcher()` / `useFetcherService()`; root setup uses `createFetcher(...)`
- Base URL is configured via env (e.g., `import.meta.env.VITE_API_URL`) or fetcher init
- Auth: Bearer token provided by the auth store/injector read by the fetcher
- Responses: JSON, the payload under `.data`. Pagination is limit/offset, and the server caps a list at 50 rows by default: an unbounded `list()` truncates without saying so
- Canonical API shapes/semantics are in FastEdgy docs (via MCP server "fastedgy-docs")
- **vue-fastedgy documentation** (fetcher, bus, etc.) is available in FastEdgy docs section "Vue.js" (accessible via MCP)
- Lint/format: `npm run fcl` (fix, format, then lint), or `npm run lint` (oxlint `--type-aware --deny-warnings`, so a warning fails it) and `npm run format` (oxfmt) on their own. The web app (`.js` + `.vue`) is at **0 lint error/warning** — keep it at zero: any new finding is a regression to fix before committing

## Api models
1) BEFORE creating or editing an api model or an api composable, MUST read the OpenAPI spec (`http://localhost:8000/openapi.json`) and locate the target operation.
2) An api model file is three lines, and stays three lines until the model needs something the generated routes do not give:
   ```js
   import { useApiModel } from 'vue-fastedgy';

   export function useStateApiModel(params = {}) {
     return useApiModel('state', { prefix: '/{app}', ...params });
   }
   ```
3) The model is named by its **metadata name**: the class name in snake_case, singular (`state`, `queued_task_log`), never the api name (`states`). `useApiModel` resolves the api name from the metadata for the URL, while the metadata store and the `/dataset/*` routes answer to the metadata name alone. The plural appears to work and breaks the rest.
4) The file is the seam for what belongs to that model: an endpoint outside the generated CRUD, or the app prefix. Nothing else goes in it, in particular no field list.
5) `X-Fields` are declared by whoever reads them, next to the code that renders them. A view asks for the fields its template and the sheets it opens use, and nothing more.
6) The methods return the fetcher response: `response.data` for a record, `response.data.items` and `response.data.total` for a list.

## Error & response handling (spec alignment)
1) Map responses by status code as documented; handle documented error shapes first.
2) If the API returns an undocumented shape/status:
   - Treat as exceptional; surface a friendly message and log a TODO with the observed delta.
3) For critical endpoints, prefer adding a lightweight runtime guard (optional) to assert top-level fields documented by the spec.

## PR requirements (checklist)
- [ ] Link to OpenAPI spec used and `info.version` (or last-modified).
- [ ] Paste `operationId` and method+path.
- [ ] Note any deviations (temporary workarounds) with a TODO and owner.

## Rules
1) Single client
   1. All HTTP calls go through the **fetcher** (no raw `fetch()` and no third-party clients)
   2. The fetcher MUST handle:
      - Base URL joining + default headers (`Accept: application/json`)
      - Token injection (`Authorization: Bearer <token>`) when present
      - JSON auto-parse when `Content-Type` is JSON; handle 204 No Content
      - Abort/timeout using `AbortController` (default ~15s)
      - Consistent error mapping (see #3)

2) Api composables (routes that answer to no model)
   1. One file per subject in the area that owns the endpoints, exposing a `use<Subject>Api()` that returns its calls:
      ```js
      export function useConsoleInfoApi(params = {}) {
        const fetcher = useFetcherService();
        const base = params.prefix || '/{app}';

        return {
          /**
           * operationId: get_console_info
           * GET /api/console/info
           *
           * @returns {Promise<Record<string, any>>}
           */
          read: async () => (await fetcher.get(`${base}/info`)).data,
        };
      }
      ```
   2. They return the payload, never the raw response, and keep the `operationId` and the method plus path in a JSDoc tag
   3. An endpoint that belongs to a model is NOT one of these: it is an action of that model's api model, reached with `action()`
   4. A framework route (storage, dataset, auth) is not written by hand: it comes from a vue-fastedgy composable (`useStorage`, `useDataset`, the auth store), and gets added there if it is missing
   5. Nothing else builds a server url: a `.vue` or a store that writes a path is a bug

3) Errors & resilience
   1. The fetcher maps errors to:
      ```js
      /** @typedef {{ code: string, status: number, message: string, details?: any }} ApiError */
      ```
   2. Treat 4xx as non-retryable; 5xx and network errors may retry with exponential backoff (max 2)
   3. If refresh tokens are supported, implement refresh **inside the fetcher** (single-flight lock), not in services
   4. Do not surface server stack traces; expose `code` + user-friendly `message`

4) Pagination / sorting / filtering
   1. Every list is bounded. A list on screen goes through `useDataIterator(apiModel, { fields, filter, defaultOrderBy })`; a one-off read passes an explicit `limit`. A bare `list({ filter })` is a bug: it stops at the fiftieth row and says nothing
   2. A screen that continues on scroll takes `append: true` and drops a `<LoadMoreTrigger v-if="hasMore" @visible="loadMore" />` after its list; the console keeps the pagination bar of `DataTable` / `DataGrid`
   3. Filters are Query Builder rules (`['field', 'op', value]`), an array of rules being an implicit AND. Search is `['search_value', 'search_fuzzy', text]`, debounced (`watchDebounced`, 300 ms)
   4. Always show a clear Empty State; display `total` when the screen is about how many there are

5) List state
   1. `useDataIterator` holds `items`, `total`, `loading`, `loaded`, `error`, `hasMore`, the query state and `refresh`. NEVER write a per-screen composable that holds a list: the view calls the iterator, declares its fields, and reads what comes back
   2. After a create, an update or a delete, call the iterator's `refresh()`; a detail view re-reads its own record and sends the screen back to the list when the record is gone
   3. Do not persist anything beyond the session

6) Security & compliance
   1. Never log tokens or sensitive data
   2. Sanitize/allowlist user-provided filters before sending to the API
   3. MUST consult MCP (`searchMkDoc` → `fetchMkDoc`) to confirm exact payload shapes, status codes, and error envelopes **before** adding/changing an api call
   4. When working with FastEdgy concepts (API Routes Generator, Query Builder, Fields Selector, Metadata Generator, Queued Tasks, i18n, Multi Tenant, Email, Storage, Authentication, settings) or vue-fastedgy features (fetcher config, bus, composables), MUST consult MCP **fastedgy-docs** → `searchMkDoc("keywords")` or `searchMkDoc("Vue.js [concept]")` for official patterns

7) What belongs in vue-fastedgy rather than here
   1. A headless piece that is generic and speaks to the FastEdgy API belongs in the package: the fetcher, the api model, the holders (`useApiCollection`, `useApiRecord`), `useApiOptions`, `useApiForm`, `useDataset`, `useStorage`, the realtime socket. Writing it in `web/src/` is how the same thing ends up written twice
   2. Never a `.vue` with an interface, never a toast, never an i18n string, never a domain rule: the package throws, the app displays
   3. Editing the package: change the source in the local vue-fastedgy checkout, `npm run build` for the types, copy the changed files into `node_modules/vue-fastedgy`, then restart vite with `--force`, which otherwise keeps serving the pre-bundle it optimized earlier

8) Developer experience
   1. Use **JSDoc** to document params, returns and the `operationId` of every call
   2. For critical endpoints, you may validate responses with a lightweight runtime check (e.g., custom guards) where appropriate
   3. Keep api modules side-effect free (pure functions calling fetcher)

9) Tests (api layer & fetcher)
   1. Use `vitest` + `@vue/test-utils` (the installed toolchain; no `msw`). Stub the fetcher/api at the module boundary
   2. Run with `npm test` (`vitest run`, jsdom, configured in `web/vite.config.js`); `npm test -- <path>` for one file, `npm run test:watch` while writing
   3. Files live in `web/tests/`, mirroring the tree of `web/src/` they cover, as `<Name>.test.js` (e.g. `web/tests/common/components/ui/badge/Badge.test.js`), and import through the `@/` alias
   4. Test **fetcher** once (token injection, timeout/abort, error mapping, retry policy)
   5. An api composable with logic of its own gets its happy path and the failures that change the screen (401, 404, 409, 429)
   6. Every bug fix adds a narrow regression test. Check it fails on the old code before keeping it
   7. `web/vitest.setup.js` installs i18n and the `v-tc` directive globally: without them `mount()` throws on any component carrying user-facing text. It also inlines `vue-fastedgy`, which reads `import.meta.env` at module scope
