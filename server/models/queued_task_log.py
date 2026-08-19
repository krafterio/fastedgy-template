from fastedgy.i18n import _t
from fastedgy.models.queued_task_log import BaseQueuedTaskLog


class QueuedTaskLog(BaseQueuedTaskLog):
    class Meta:  # type: ignore
        tablename = "queued_task_logs"
        label = _t("Log de la tâche en file d'attente")
        label_plural = _t("Logs de la tâche en file d'attente")
        default_order_by = [("created_at", "desc")]
