from fastedgy.api_route_model import api_route_model
from fastedgy.i18n import _ts
from fastedgy.models.base import BaseModel
from fastedgy.orm import fields
from fastedgy.orm.order_by import OrderByList


@api_route_model(prefix="/{app}")
class Country(BaseModel):
    class Meta:  # type: ignore
        tablename = "countries"
        label = _ts("Pays")
        label_plural = _ts("Pays")
        default_order_by: OrderByList = [("name", "asc")]

    name: str | None = fields.CharField(
        label=_ts("Nom"),
        max_length=255,
    )  # type: ignore

    code: str | None = fields.CharField(
        label=_ts("Code"),
        max_length=3,
    )  # type: ignore
