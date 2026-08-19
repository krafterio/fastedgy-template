from typing import TYPE_CHECKING

from fastedgy.api_route_model import api_route_model
from fastedgy.i18n import _t
from fastedgy.models.base import BaseModel
from fastedgy.orm import fields
from fastedgy.orm.order_by import OrderByList

if TYPE_CHECKING:
    from models.country import Country


@api_route_model(prefix="/{app}")
class State(BaseModel):
    class Meta:  # type: ignore
        tablename = "states"
        label = _t("Département/État")
        label_plural = _t("Départements/États")
        default_order_by: OrderByList = [("code", "asc")]

    country: Country | None = fields.ForeignKey(
        "Country",
        label=_t("Pays"),
        null=False,
        on_delete="CASCADE",
    )  # type: ignore

    code: str = fields.CharField(
        label=_t("Code"),
        max_length=10,
        unique=False,
    )  # type: ignore

    name: str = fields.CharField(
        label=_t("Nom"),
        max_length=255,
    )  # type: ignore
