"""Project fixtures.

FastEdgy's test toolkit is loaded as a pytest plugin from the root conftest, so
its fixtures (`setup_db`, `setup_http`, `anyio_backend`, …) are available by name
without being imported here. This module wires only the project-specific bits.

Every test starts from a truncated database, inside a `<database>-test` the
toolkit creates and drops itself: the development database is never touched, and
a test that fails halfway leaves nothing behind for the next one.

Reference data (countries, states) is not seeded: build what a test needs through
`factories.py`. The toolkit's `seed_data` hook is where a project-wide seeder goes
the day one is needed; it would call fastedgy's `load_data()`, which is what
`kt db init-data` runs over `server/data/`.
"""

from typing import Any

import httpx
import pytest


@pytest.fixture
async def user(setup_db: Any) -> Any:
    """A plain user."""
    from factories import create_user

    return await create_user()


@pytest.fixture
async def admin(setup_db: Any) -> Any:
    """An admin, the one the console lets through."""
    from factories import create_admin

    return await create_admin()


@pytest.fixture
async def client(setup_http: httpx.AsyncClient, user: Any) -> httpx.AsyncClient:
    """HTTP client authenticated as a plain user."""
    from factories import authenticate

    return authenticate(setup_http, user)


@pytest.fixture
async def console(setup_http: httpx.AsyncClient, admin: Any) -> httpx.AsyncClient:
    """HTTP client authenticated as an admin, for `/api/console/…`."""
    from factories import authenticate

    return authenticate(setup_http, admin)
