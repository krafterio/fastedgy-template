from typing import Any


async def test_an_email_sent_to_me_changes_neither_the_name_nor_the_email(client: Any) -> None:
    response = await client.patch("/api/me", json={"email": "other@example.io"})
    me = (await client.get("/api/me")).json()

    assert response.status_code == 200, response.text
    assert (me["name"], me["email"]) == ("User", "user@example.io")


async def test_me_changes_the_name_and_the_avatar(client: Any) -> None:
    response = await client.patch("/api/me", json={"name": "Jane", "avatar": "avatars/jane.png"})

    assert response.status_code == 200, response.text
    assert (response.json()["name"], response.json()["avatar"]) == ("Jane", "avatars/jane.png")
