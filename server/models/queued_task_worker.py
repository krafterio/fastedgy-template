from fastedgy.models.queued_task_worker import BaseQueuedTaskWorker
from fastedgy.i18n import _t


class QueuedTaskWorker(BaseQueuedTaskWorker):
    class Meta:  # type: ignore
        tablename = "queued_task_workers"
        label = _t("Worker de la tâche en file d'attente")
        label_plural = _t("Workers de la tâche en file d'attente")
        default_order_by = [("created_at", "desc")]
