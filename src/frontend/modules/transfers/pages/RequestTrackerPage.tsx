import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useActor } from "../../../shared/hooks/useActor";
import { Button } from "../../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../../shared/components/Card";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { transfersApi, TransferRequestView } from "../services/transfersApi";
import { ManagerDecisionPanel } from "../components/ManagerDecisionPanel";
import { HrDecisionPanel } from "../components/HrDecisionPanel";

const TERMINAL_STATUSES = new Set(["Completed", "Rejected", "Withdrawn"]);
const WITHDRAWABLE_STATUSES = new Set(["Submitted", "Returned for Amendment", "Under HR Review"]);

/** T23 - AC13/AC14: consolidated status + pending-action view for the employee, plus the
 * minimal manager/HR action panels (T24) so the same page can drive the whole demo flow. */
export function RequestTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const [actor] = useActor();
  const [view, setView] = useState<TransferRequestView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(() => {
    if (!id || !actor.id) return;
    transfersApi
      .get(actor, id)
      .then((v) => {
        setView(v);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load request"));
  }, [id, actor]);

  useEffect(() => {
    load();
  }, [load]);

  if (!actor.id) return <p className="text-sm text-slate-500">Set an actor id above to continue.</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!view) return <p className="text-sm text-slate-500">Loading...</p>;

  async function handleWithdraw() {
    if (!id) return;
    setWithdrawing(true);
    try {
      await transfersApi.withdraw(actor, id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Transfer Request</h1>
        <StatusBadge status={view.status} />
      </div>

      <Card>
        <CardHeader className="text-xs font-medium uppercase tracking-wide text-slate-400">Details</CardHeader>
        <CardBody className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">Pending action:</span>{" "}
            {view.pendingAction.stakeholder
              ? `${view.pendingAction.stakeholder} (since ${new Date(view.pendingAction.pendingSince!).toLocaleDateString()})`
              : "None"}
          </p>
          <p>
            <span className="font-medium text-slate-900">Effective date:</span> {new Date(view.effectiveDate).toLocaleDateString()}
          </p>
          {view.reason && (
            <p>
              <span className="font-medium text-slate-900">Reason:</span> {view.reason}
            </p>
          )}
        </CardBody>
      </Card>

      {!TERMINAL_STATUSES.has(view.status) && WITHDRAWABLE_STATUSES.has(view.status) && (
        <Button variant="danger" onClick={handleWithdraw} disabled={withdrawing}>
          {withdrawing ? "Withdrawing..." : "Withdraw request"}
        </Button>
      )}

      {view.status === "Submitted" && id && <ManagerDecisionPanel requestId={id} onDecided={load} />}
      {view.status === "Under HR Review" && id && <HrDecisionPanel requestId={id} onDecided={load} />}

      {view.history.length > 0 && (
        <Card>
          <CardHeader className="text-xs font-medium uppercase tracking-wide text-slate-400">History</CardHeader>
          <CardBody className="space-y-2.5 text-sm">
            {view.history.map((h, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <span className="text-slate-700">
                  <span className="font-medium text-slate-900">{h.actor}</span> {h.action}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
