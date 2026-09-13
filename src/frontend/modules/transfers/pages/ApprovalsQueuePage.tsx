import { useEffect, useState } from "react";
import { useActor } from "../../../shared/hooks/useActor";
import { ApiClientError } from "../../../shared/services/apiClient";
import { QueueList } from "../components/QueueList";
import { transfersApi, QueueItem } from "../services/transfersApi";

/** Manager-facing queue: requests waiting on this actor's confirm/decline/return decision,
 * as either the current or receiving manager (API11, documented in the Spec's Round 2
 * API Contract Additions). */
export function ApprovalsQueuePage() {
  const [actor] = useActor();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    transfersApi
      .pendingManagerApprovals(actor)
      .then((res) => {
        setItems(res.items);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.body.error ?? "Failed to load" : "Failed to load approvals queue"))
      .finally(() => setLoading(false));
  }, [actor.id]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Manager Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Transfer requests awaiting your decision as current or receiving manager.</p>
      </div>

      {!actor.id && <p className="text-sm text-slate-500">Set an actor id to see requests assigned to you.</p>}
      {actor.id && loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {actor.id && !loading && !error && (
        <QueueList items={items} emptyMessage="No requests are currently waiting on your decision." />
      )}
    </div>
  );
}
