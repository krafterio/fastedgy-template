"""The harness itself, and the three doors it opens.

These are not tests of a feature: they are what tells you the setup still works.
The day a fixture breaks, every other test fails at once for a reason none of
them names, and this file is the one that says which door is shut.

`{app}` is the surface segment, not the role: the same routes answer the business
app and the console, and `get_app_context` decides which caller is allowed.
"""

from typing import Any


async def test_a_public_route_answers_without_a_token(setup_http: Any) -> None:
    response = await setup_http.get("/api/hello")

    assert response.status_code == 200, response.text


async def test_the_console_reaches_its_own_surface(console: Any) -> None:
    response = await console.get("/api/console/info")

    assert response.status_code == 200, response.text
    assert response.json()["success"] is True


async def test_a_plain_user_is_not_the_console(client: Any) -> None:
    response = await client.get("/api/console/info")

    assert response.status_code == 403, response.text


async def test_the_app_surface_serves_a_plain_user(client: Any) -> None:
    response = await client.get("/api/app/countries")

    assert response.status_code == 200, response.text


async def test_an_unknown_surface_is_not_a_surface(console: Any) -> None:
    response = await console.get("/api/whatever/countries")

    assert response.status_code == 404, response.text


async def test_a_factory_row_is_readable_over_http(client: Any) -> None:
    from factories import create_country

    await create_country()

    payload = (await client.get("/api/app/countries")).json()

    assert [item["code"] for item in payload["items"]] == ["FR"]
