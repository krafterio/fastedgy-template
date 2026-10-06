from pathlib import Path
from typing import Any


async def test_the_file_cleanup_is_wired_once(setup_app: Any) -> None:
    from blinker import ANY
    from fastedgy.orm.signals import post_delete, pre_delete
    from fastedgy.storage.models.attachment import on_post_delete, on_pre_delete
    from models.attachment import Attachment

    for signal, cleanup in ((pre_delete, on_pre_delete), (post_delete, on_post_delete)):
        assert set(signal.receivers_for(Attachment)) - set(signal.receivers_for(ANY)) == {cleanup}


async def test_deleting_an_attachment_deletes_its_file(setup_db: Any) -> None:
    from fastedgy.storage.models.attachment import AttachmentType
    from fastedgy.test.fixtures import stored_file_path
    from models.attachment import Attachment

    stored = Path(stored_file_path("attachments/report.pdf"))
    stored.parent.mkdir(parents=True, exist_ok=True)
    stored.write_bytes(b"%PDF-1.7")
    attachment = Attachment(
        name="report",
        extension="pdf",
        type=AttachmentType.file,
        storage_path="attachments/report.pdf",
    )
    await attachment.save()

    await attachment.delete()

    assert not stored.exists()
