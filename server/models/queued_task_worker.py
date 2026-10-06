from fastedgy.i18n import _ts
from fastedgy.models.queued_task_worker import BaseQueuedTaskWorker


class QueuedTaskWorker(BaseQueuedTaskWorker):
    class Meta:  # type: ignore
        tablename = "queued_task_workers"
        label = _ts("Worker de la tâche en file d'attente")
        label_plural = _ts("Workers de la tâche en file d'attente")
        default_order_by = [("created_at", "desc")]
