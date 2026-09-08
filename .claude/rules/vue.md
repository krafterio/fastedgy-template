# Vue 3 rules (Fastedgy frontend, JavaScript)

## Project Facts
- Stack: Vue 3 + Vite, Composition API only (no Options API).
- State: Pinia.
- Router: Vue Router (SPA).
- UI: **shadcn-vue** components (built on reka-ui / radix-vue), plus `@headlessui/vue`; styling via Tailwind CSS v4. Add new primitives through shadcn-vue rather than ad-hoc libraries.
- Code organized by area module: `web/src/{console,common,main}/`, each with `components/`, `composables/`, `stores/`, `views/`. Every server call lives in a `composables/api/`: the models in `common/`, the endpoints of a surface in that surface's area.
- HTTP: model routes through an **api model** (`common/composables/api/<model>.js`, wrapping `useApiModel()`), lists through **`useDataIterator`**, framework routes through the vue-fastedgy composables (`useStorage`, `useDataset`). The raw **fetcher** (`useFetcher()` / `useFetcherService()`) is for a route that answers to no model. Not Axios.
- FastEdgy product docs are exposed via an MCP server named "fastedgy-docs".
- **vue-fastedgy documentation** (fetcher, bus, composables) is available in FastEdgy docs section "Vue.js".

## Rules
1) Components
   1. Use `<script setup>` in SFCs.
   2. Keep components focused (one UI responsibility). Use `defineProps` / `defineEmits`.
   3. A `.vue` never builds a URL and never calls `fetch`. It goes through the api model of the record it shows, through `useDataIterator` for a list, through the api composable of the subject for the rest. Reading in a view is normal, that is where the fields it renders are declared.

2) Stores (Pinia)
   1. One store per domain (`useUserStore`, `useOrdersStore`, …), for state the whole app reads. A screen's own list is not store material.
   2. Stores do not call `fetch` directly: they go through an api model or an api composable.
   3. Track `status` ('idle' | 'loading' | 'success' | 'error') and a serializable `error`.

3) Async data
   1. A list is held by `useDataIterator`, which hands back `{ items, total, loading, loaded, error, hasMore, loadMore, filter, refresh }`. A record is read by the view through its api model. NEVER wrap either in a composable of its own per screen.
   2. Deterministic loading states (skeletons/placeholders); avoid infinite spinners. `loaded` is what the skeleton listens to, not `loading`: a search must not blank the list it is filtering.
   3. Use `Suspense` only for top-level views, not micro-interactions.

4) Accessibility & i18n
   1. Add ARIA where relevant; manage focus for modals/menus.
   2. All user-facing text goes through i18n—no hardcoded strings in logic.

5) Navigation & security
   1. Global guard: if route meta `auth.required === true`, validate token via the user store; redirect to `/login?next=…`.
   2. Never embed secrets; config comes from `import.meta.env`.

6) FastEdgy integration (MCP-first)
   1. If a task involves FastEdgy concepts (API Routes Generator, Query Builder, Fields Selector, Metadata Generator, Queued Tasks, i18n, Multi Tenant, Email, Storage, Authentication, settings) OR **vue-fastedgy features** (fetcher, bus, composables):
      - MUST first call MCP **fastedgy-docs** → `searchMkDoc("keywords")` or `searchMkDoc("Vue.js [concept]")` for vue-fastedgy, then `fetchMkDoc(uri)` for the top result **before coding**.
      - In PRs, reference the consulted doc section (file/heading or link).
   2. If docs don't cover the need, create a minimal wrapper and add a TODO with a link to the doc gap.

8) Translation & i18n
   1. **Usage in components**:
      - Import `useI18n` from `vue-i18n` in `<script setup>`
      - Destructure `const { t } = useI18n()` to access the translation function
      - Use the directive `v-tc` in HTML tags (`<span>`, `<p>`, etc.) for free text content that is NOT in key format
      - Use `t(\`English text\`)` for dynamic strings in script
      - Use `$t(\`English text\`)` directly in templates for key-formatted strings
   2. **Text format distinction**:
      - **Free text**: Use `<span v-tc>Welcome to our platform</span>` or `<p v-tc>This is a description</p>`
      - **Key format**: Use `$t(\`welcome.message\`)` or `$t(\`form.email\`)` (lowercase alpha characters with _ or . separators, no spaces)
   3. **Strict rules**:
      - NEVER hardcode strings in French/English in templates or logic
      - All user-facing text must go through `v-tc`, `t()` or `$t()`
      - Input placeholders, labels, error messages, titles, descriptions must be translated
   4. **Organization**: Use English text directly as translation key with backticks (e.g. `$t(\`Welcome to our platform\`)`, `$t(\`Email\`)`, `$t(\`Password\`)`)

9) UI tests
   1. Use `@vue/test-utils` + `vitest` (jsdom) — the installed toolchain; run with `npm test` (`npm test -- <path>` for one file, `npm run test:watch` while writing). i18n and the `v-tc` directive are installed globally by `web/vitest.setup.js`, so a component carrying text mounts as-is.
   2. `mount()` the component, assert on what it renders (text, classes, `data-slot`, emitted events) — never on its internals. Files live in `web/tests/`, at the same path as the component under `web/src/`, as `<Name>.test.js`.
   3. Mock the **api composables** (which use fetcher), not Pinia stores, for unit tests.
   4. Every bug fix adds a narrow regression test. Check it fails on the old code before keeping it.

10) Performance
   1. Code-split heavy views (`defineAsyncComponent`).
   2. Memoize expensive derived data with `computed`; avoid unnecessary watchers.
   3. Lists with > ~200 visible items must use pagination or virtualization.
