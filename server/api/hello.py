from datetime import datetime
from fastapi import APIRouter
from fastedgy.dependencies import Inject
from pydantic import BaseModel

from fastedgy import context
from fastedgy.i18n import I18n, _t

from main import AppSettings


router = APIRouter(prefix="/hello", tags=["hello"])


class Hello(BaseModel):
    message: str
    locale: str
    available_locales: list[str]
    timezone: str
    current_time: str


@router.get("")
async def hello(i18n: I18n = Inject(I18n), config: AppSettings = Inject(AppSettings)) -> Hello:
    return Hello(
        message=_t("Hello from FastEdgy!"),
        locale=context.get_locale(),
        available_locales=i18n.get_available_locales(),
        timezone=config.timezone,
        current_time=datetime.now().isoformat(),
    )
