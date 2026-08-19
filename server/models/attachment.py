from fastedgy.api_route_model import api_route_model
from fastedgy.i18n import _t
from fastedgy.models.attachment import AttachmentPathMixin, BaseAttachment
from fastedgy.models.mixins import BlameableMixin


@api_route_model(
    prefix="/{app}",
    actions={
        "create": False,
    },
)
class Attachment(BaseAttachment, AttachmentPathMixin, BlameableMixin):  # type: ignore
    class Meta:  # type: ignore
        tablename = "attachments"
        label = _t("Pièce jointe")
        label_plural = _t("Pièces jointes")
