from fastedgy.i18n import _ts
from fastedgy.models.queued_task_log import BaseQueuedTaskLog


class QueuedTaskLog(BaseQueuedTaskLog):
    class Meta:  # type: ignore
        tablename = "queued_task_logs"
        label = _ts("Log de la tâche en file d'attente")
        label_plural = _ts("Logs de la tâche en file d'attente")
        default_order_by = [("created_at", "desc")]
