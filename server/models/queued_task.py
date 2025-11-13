from fastedgy.models.queued_task import BaseQueuedTask
from fastedgy.i18n import _t


class QueuedTask(BaseQueuedTask):
    class Meta:  # type: ignore
        tablename = "queued_tasks"
        label = _t("Tâche en file d'attente")
        label_plural = _t("Tâches en file d'attente")
        default_order_by = [("created_at", "desc")]
