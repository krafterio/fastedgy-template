from typing import Any
from fastedgy.orm.signals import post_delete, pre_delete
from fastedgy.storage.models.attachment import on_pre_delete, on_post_delete

from models.attachment import Attachment


@pre_delete.connect_via(Attachment)
async def _on_pre_delete(sender: Any, instance: Any, model_instance: Any, **kwargs: Any) -> None:
    await on_pre_delete(sender, instance, model_instance, **kwargs)


@post_delete.connect_via(Attachment)
async def _on_post_delete(sender: Any, instance: Any, model_instance: Any, **kwargs: Any) -> None:  # noqa: ANN401
    await on_post_delete(sender, instance, model_instance, **kwargs)
