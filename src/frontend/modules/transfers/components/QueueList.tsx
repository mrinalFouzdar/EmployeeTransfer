import { Link } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { QueueItem } from "../services/transfersApi";

export function QueueList({ items, emptyMessage }: { items: QueueItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <Card className="px-5 py-10 text-center text-sm text-slate-500">
        <p>{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100 overflow-hidden">
      {items.map((item) => (
        <Link
          key={item.requestId}
          to={`/requests/${item.requestId}`}
          className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-slate-50"
        >
          <div>
            <p className="font-medium text-slate-900">{item.employeeId}</p>
            <p className="text-xs text-slate-500">Effective {new Date(item.effectiveDate).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={item.status} />
        </Link>
      ))}
    </Card>
  );
}
