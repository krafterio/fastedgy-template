"""Project-specific test factories and auth helpers.

FastEdgy ships generic factories (`fastedgy.test.factories`) wired to its own demo
models. These are the project equivalents: they write through the ORM, not over
HTTP, so a fixture that needs a row does not have to exercise the API to get one.
"""

from typing import Any

import httpx
from fastedgy.depends.security import create_access_token, hash_password


async def create_user(
    email: str = "user@example.io",
    name: str = "User",
    password: str = "secret",
    **extra: Any,
):
    """Create and persist a user, password hashed like the CLI does."""
    from models.user import User

    user = User(email=email, name=name, password=hash_password(password), **extra)
    await user.save()

    return user


async def create_admin(email: str = "admin@example.io", name: str = "Admin", **extra: Any):
    """The user the console routes let through."""
    from models.user import UserRole

    return await create_user(email=email, name=name, role=UserRole.admin, **extra)


async def create_country(code: str = "FR", name: str = "France", **extra: Any):
    """A country, the reference row states hang from."""
    from models.country import Country

    country = Country(code=code, name=name, **extra)
    await country.save()

    return country


def authenticate(client: httpx.AsyncClient, user: Any) -> httpx.AsyncClient:
    """Authenticate an HTTP client as `user` for subsequent requests."""
    client.headers["Authorization"] = f"Bearer {create_access_token({'sub': user.email})}"

    return client
