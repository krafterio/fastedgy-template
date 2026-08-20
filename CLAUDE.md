# FastEdgy Template

Application FastEdgy (FastAPI + Edgy ORM côté backend, Vue 3 + Vite côté frontend web app).

## Architecture

```
server/    # Backend FastAPI + Edgy ORM (api/, models/, services/, schemas/, data/, migrations/, queued_tasks/, scheduler/) — CLI kt
web/       # Web app Vue 3 + Vite, multi-SPA : index.html→src/main, console.html→src/console, src/common partagé
```

Entry points : `server/main.py` · `web/src/{main,console}/main.js`.

## Documentation

Doc projet & configs dans `docs/` — index : [docs/README.md](docs/README.md).

## Règles du projet

@.claude/rules/fastedgy.md
@.claude/rules/python.md
@.claude/rules/javascript.md
@.claude/rules/vue.md

## Commandes

Outils natifs uniquement (le `justfile` est un helper dev optionnel — ne pas l'utiliser ici).

Premier lancement : `uv sync` · `npm install` · DB : `uv run kt db init`, `uv run kt db createdb`, `uv run kt db makemigrations`, `uv run kt db migrate`, `uv run kt db init-data`.

| Commande | Description |
|----------|-------------|
| `uv run kt serve` | Lance le serveur dev (host 0.0.0.0, port 8000, reload) |
| `uv run kt db makemigrations -m "..."` | Génère une migration |
| `uv run kt db migrate` | Applique les migrations |
| `uv run kt db init-data` | Charge les données de référence décrites dans `server/data/*.py` |
| `uv run kt trans extract` | Extrait les chaînes traduisibles → fichiers `.po` |
| `npm run dev` | Lance la web app Vue (vite, port 5173) |
| `uv run kt --help` | Reste de la CLI FastEdgy (db, queue, ai, push, trans…) |

Spec OpenAPI : `http://localhost:8000/openapi.json` — préflight obligatoire avant tout
changement d'API (cf. règles fastedgy).

## Tests

Les deux stacks ont leur suite — un bugfix ajoute son test de régression (cf. règles).

| Stack | Suite complète | Ciblé |
|-------|----------------|-------|
| serveur | `uv run pytest -n 4` (`server/tests/`) | `uv run pytest server/tests/test_<x>.py` |
| web app | `npm test` (vitest) | `npm test -- <path>` |

## Qualité du code

Auto-correction (lint --fix + format), via slash commands ou outils directs :

- `/fixpy` — `uv run ruff check --fix` + `uv run ruff format`
- `/fixjs` — `npm run fix` (oxlint --fix) + `npm run format` (oxfmt)
- `/fix` — les deux stacks d'un coup

Pour résoudre des erreurs de lint, lancer le fix de la stack concernée (ou `/fix`)
pour auto-corriger, puis corriger manuellement ce qui reste.
Note : ces fix opèrent sur tout le code de la stack — vérifier le diff avant de commiter.

Les deux stacks sont à **zéro** : `npm run lint` sans erreur ni avertissement, `uv run pyright`
sans erreur. Toute nouvelle remontée est une régression à corriger avant de commiter.

### Vérification de type Python (Pyright)

Ruff ne fait que du lint ; le typage est vérifié par Pyright. Le projet est à **zéro erreur**.
Après toute édition d'un `.py`, lancer `uv run pyright <fichier(s) modifié(s)>` et le garder à
zéro : toute nouvelle erreur est une régression à corriger avant de commiter.
