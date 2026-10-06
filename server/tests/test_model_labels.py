from typing import Any

import pytest


async def test_a_label_is_rendered_with_the_metadata_not_at_import(
    setup_app: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    from fastedgy.dependencies import get_service
    from fastedgy.i18n import I18n
    from fastedgy.metadata_model.generator import generate_metadata_model
    from fastedgy.models.base import BaseModel
    from fastedgy.orm import Registry

    monkeypatch.setattr(I18n, "translate", lambda self, message, **kwargs: f"<{message}>")
    project_models = [
        model
        for model in get_service(Registry).models.values()
        if issubclass(model, BaseModel) and model.__module__.startswith("models.")
    ]
    untranslated = []

    for model in project_models:
        metadata = await generate_metadata_model(model)
        labels = [metadata.label, metadata.label_plural, *(field.label for field in metadata.fields.values())]
        untranslated += [f"{model.__name__}: {label}" for label in labels if not label.startswith("<")]

    assert untranslated == []
