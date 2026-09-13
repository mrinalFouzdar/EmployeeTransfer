import { useEffect, useState } from "react";
import { useActor } from "../../../shared/hooks/useActor";
import { ApiClientError } from "../../../shared/services/apiClient";
import { QueueList } from "../components/QueueList";
import { transfersApi, QueueItem } from "../services/transfersApi";

/** HR-facing queue: requests that have cleared both manager confirmations and are waiting
 * on an HR eligibility decision (API12, documented in the Spec's Round 2 API Contract
 * Additions). Requires x-actor-role: HR - the backend returns 403 otherwise. */
export function HrReviewQueuePage() {
  const [actor] = useActor();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!actor.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setForbidden(false);
    transfersApi
      .pendingHrReview(actor)
      .then((res) => {
        setItems(res.items);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 403) {
          setForbidden(true);
        } else {
          setError(err instanceof ApiClientError ? err.body.error ?? "Failed to load" : "Failed to load HR review queue");
        }
      })
      .finally(() => setLoading(false));
  }, [actor.id, actor.role]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">HR Review Queue</h1>
        <p className="mt-1 text-sm text-slate-500">Requests confirmed by both managers, waiting on an HR eligibility decision.</p>
      </div>

      {!actor.id && <p className="text-sm text-slate-500">Set an actor id to continue.</p>}
      {actor.id && loading && <p className="text-sm text-slate-500">Loading...</p>}
      {forbidden && (
        <p className="text-sm text-red-600">Set the actor role above to "HR" to view this queue - it requires the x-actor-role: HR header.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {actor.id && !loading && !error && !forbidden && (
        <QueueList items={items} emptyMessage="No requests are currently waiting on HR review." />
      )}
    </div>
  );
}
