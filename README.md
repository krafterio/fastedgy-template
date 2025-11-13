# FastEdgy Template

The project template for FastEdgy.


## Prerequisites

- Python 3.13+
- UV (Python Package Manager, see the [installation doc](https://docs.astral.sh/uv/getting-started/installation))
- NVM for Node.js 22.0+ (see the [installation doc](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating))
- PostgreSQL 17.0+ (with CLI Tools in PATH)


## Installation

1. Clone the project:

```bash
git clone git@github.com:krafterio/fastedgy-template.git
```

2. Install server dependencies:

```bash
uv sync
```

3. Restart terminal or activate venv:

```bash
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows
```

4. Install app dependencies:

```bash
nvm install 22
nvm use 22
npm install
```

5. Configure environment variables:

```bash
cp .env.tpl .env
# Edit .env file with your configurations
```


## Database Setup

1. Create PostgreSQL database:

```bash
kt db createdb
```

2. Initialize migrations:

```bash
kt db init
kt db makemigrations -m "init project"
kt db migrate
```

3. Initialize data of database:
```bash
kt db init-data
```


## Starting the Server

### Via CLI
```bash
kt serve
```

### Via VS Code
1. Open the project in VS Code
2. Launch the server (Server)


## Starting the App

### Via CLI
```bash
npm run dev
```

### Via VS Code
1. Open the project in VS Code
2. Launch the app (App) or the app and the server (All)


## API Endpoints

Swagger Documentation: http://localhost:8000/docs


## Usage

### CLI Commands

The project use a FastEdgy CLI (`fastedgy` or `fe` or `kt` aliases) to facilitate common tasks.

#### Start the Server

```bash
kt serve
```

Available options:
- `--host`: Server host (default: 0.0.0.0)
- `--port`: Server port (default: 8000)
- `--reload/--no-reload`: Enable/disable hot reload (default: enabled)

Example:
```bash
kt serve --port 8080 --no-reload
```

#### Database Management

Create a new migration:
```bash
kt db makemigrations -m "migration description"
```

Apply pending migrations:
```bash
kt db migrate
```

Revert the last migration:
```bash
kt db downgrade
```

View migration history:
```bash
kt db history
```

### API Documentation

Once the server is running, you can access:
- Swagger UI Documentation: http://localhost:8000/docs
- ReDoc Documentation: http://localhost:8000/redoc


## Development

### Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/feature-name
   ```
2. Make your changes
3. Create a migration if you modify models:
   ```bash
   kt db makemigrations -m "description of changes"
   kt db migrate
   ```
4. Test your changes
5. Create a pull request


# Troubleshooting

## Error JS in production but not in development

To debug a build while having access to the source code, you must run the commands:

```bash
npm run build -- --minify=false --sourcemap --debug
npm run preview -- --open
```

## Commit message format convention

This project uses the **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)** naming convention.

### Basic structure of a Conventional commit

```
<type>(<scope>): <description>
```

- **type**: the type of modification made (required)
- **scope**: the scope (optional, but recommended)
- **description**: a short explanation (imperative, no capital letters, no period)

### Conventional Commits Types used

| Type     | Description                                                                    |
|----------|--------------------------------------------------------------------------------|
| feat     | New feature                                                                    |
| fix      | Bug fix                                                                        |
| docs     | Change in documentation                                                        |
| style    | Change of format (indentation, spaces, etc.) without functional impact         |
| refactor | Refactoring the code without adding or correcting functionality                |
| revert   | Reverting a previous commit                                                    |
| merge    | Merging branches                                                               |
| test     | Adding or modifying tests                                                      |
| chore    | Miscellaneous tasks without direct impact (build, dependencies, configs, etc.) |
| perf     | Performance improvement                                                        |
| ci       | Changes to CI/CD files (Github Actions, Gitlab CI, etc.)                       |
| release  | Creating a new release                                                         |

### Conventional Commits Scopes used

| Scope   | Description                                             |
|---------|---------------------------------------------------------|
| core    | Core backend logic and main platform features           |
| cli     | CLI commands and related functionality                  |
| orm     | ORM models, migrations, and related logic               |
| auth    | Authentication and authorization mechanisms             |
| api     | REST API endpoints, routes, and controllers             |
| config  | Global configuration and environment settings           |
| project | Project structure, global files, and overall management |

## License

This project is licensed under Proprietary License. See the `LICENSE` file for details.
