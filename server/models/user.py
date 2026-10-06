from enum import Enum

from fastedgy.api_route_model.decorators import console_api_route_model
from fastedgy.i18n import _ts
from fastedgy.models.user import BaseUser
from fastedgy.orm import fields


class UserRole(Enum):
    admin = "admin"
    user = "user"


@console_api_route_model(
    create=False,
)
class User(BaseUser):
    class Meta:  # type: ignore
        tablename = "users"
        label = _ts("Utilisateur")
        label_plural = _ts("Utilisateurs")

    role: UserRole | None = fields.ChoiceField(
        UserRole,
        default=UserRole.user,
        label=_ts("Rôle"),
    )  # type: ignore

    avatar: str | None = fields.CharField(
        max_length=512,
        null=True,
        label=_ts("Avatar"),
    )  # type: ignore
