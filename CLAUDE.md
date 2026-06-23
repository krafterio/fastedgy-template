# FastEdgy Template

Application FastEdgy (FastAPI + Edgy ORM côté backend, Vue 3 + Vite côté frontend web app).

## Architecture

```
server/    # Backend FastAPI + Edgy ORM (api/, models/, services/, schemas/, migrations/, queued_tasks/, scheduler/) — CLI kt
web/       # Web app Vue 3 + Vite, multi-SPA : index.html→src/main, admin.html→src/admin, src/common partagé
```

Entry points : `server/main.py` · `web/src/{main,admin}/main.js`.

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
| `uv run kt trans extract` | Extrait les chaînes traduisibles → fichiers `.po` |
| `npm run dev` | Lance la web app Vue (vite, port 5173) |
| `uv run kt --help` | Reste de la CLI FastEdgy (db, queue, ai, push, trans…) |

Spec OpenAPI : `http://localhost:8000/openapi.json` — préflight obligatoire avant tout
changement d'API (cf. règles fastedgy).

Tests : web app `npm test` (ciblé : `npm test -- <path>`).
serveur : pas de suite pytest pour l'instant (les règles l'imposent pour les bugfix).

## Qualité du code

Auto-correction (lint --fix + format), via slash commands ou outils directs :

- `/fixpy` — `uv run ruff check --fix` + `uv run ruff format`
- `/fixjs` — `npm run fix` (oxlint --fix) + `npm run format` (oxfmt)
- `/fix` — les trois stacks d'un coup

Pour résoudre des erreurs de lint, lancer le fix de la stack concernée (ou `/fix`)
pour auto-corriger, puis corriger manuellement ce qui reste.
Note : ces fix opèrent sur tout le code de la stack — vérifier le diff avant de commiter.

### Vérification de type Python (Pyright)

Ruff ne fait que du lint ; le typage est vérifié par Pyright. Après toute édition d'un `.py`,
lancer `uv run pyright <fichier(s) modifié(s)>` et viser **zéro nouvelle erreur** sur ce qu'on
touche. Le projet a ~900 erreurs préexistantes (typage dynamique Edgy, majoritairement des faux
positifs) : ne pas chercher à nettoyer le projet entier — seulement ne pas en ajouter et corriger
celles du code qu'on écrit.
