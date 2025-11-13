from enum import Enum
from fastedgy.api_route_model.decorators import admin_api_route_model
from fastedgy.models.user import BaseUser
from fastedgy.i18n import _t
from fastedgy.orm import fields


class UserRole(Enum):
    admin = "admin"
    user = "user"


@admin_api_route_model(
    create=False,
)
class User(BaseUser):
    class Meta:  # type: ignore
        tablename = "users"
        label = _t("Utilisateur")
        label_plural = _t("Utilisateurs")

    role: UserRole | None = fields.ChoiceField(
        UserRole,
        default=UserRole.user,
        label=_t("Rôle"),
    )  # type: ignore

    avatar: str | None = fields.CharField(
        max_length=512,
        null=True,
        label=_t("Avatar"),
    )  # type: ignore
