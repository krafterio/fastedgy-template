from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock

import pytest

APP = "https://app.example.io"


def render_password_recovery(**context: str) -> str:
    from fastedgy.config import BaseSettings
    from fastedgy.dependencies import get_service
    from fastedgy.mail.service import Mail, TemplatePart

    templates = Path(__file__).parents[1] / "templates"
    settings = type(get_service(BaseSettings))(mail_templates_path=str(templates))
    context = {
        "locale": "fr",
        "email": "user@example.io",
        "recovery_url": f"{APP}/password/reset?token=secret",
        **context,
    }

    return Mail(settings).render_template("emails/fr/password_recovery.html", TemplatePart.BODY_HTML, context) or ""


async def test_the_logo_comes_from_the_app_of_the_project(setup_app: Any) -> None:
    assert f'src="{APP}/favicon.png"' in render_password_recovery(base_url_app=APP)


@pytest.mark.parametrize("context", [{}, {"base_url_app": ""}])
async def test_a_mail_without_the_app_url_is_sent_without_a_logo(setup_app: Any, context: dict[str, str]) -> None:
    html = render_password_recovery(**context)

    assert "password/reset?token=secret" in html
    assert "favicon.png" not in html


async def test_the_message_sits_inside_one_document(setup_app: Any) -> None:
    html = render_password_recovery(base_url_app=APP)

    assert html.count("</html>") == 1
    assert html.index("password/reset?token=secret") < html.index("</body>")


async def test_the_link_lasts_as_long_as_fastedgy_keeps_the_token(
    setup_http: Any, user: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    from fastedgy.mail.service import Mail
    from models.user import User

    monkeypatch.setattr(Mail, "send_template", AsyncMock())
    requested_at = datetime.now(UTC)

    response = await setup_http.post("/api/auth/password/forgot", json={"email": user.email})
    expires_at = getattr(await User.query.get(id=user.id), "reset_pwd_expires_at", None)

    assert response.status_code == 200, response.text
    assert expires_at is not None
    assert requested_at + timedelta(hours=1) <= expires_at <= datetime.now(UTC) + timedelta(hours=1)
    assert "Ce lien est valable une heure." in render_password_recovery(base_url_app=APP)
