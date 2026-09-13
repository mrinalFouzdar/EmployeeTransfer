import { useState } from "react";
import { useActor } from "../../../shared/hooks/useActor";
import { ApiClientError } from "../../../shared/services/apiClient";
import { Button } from "../../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../../shared/components/Card";
import { transfersApi } from "../services/transfersApi";

const selectClasses =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const textareaClasses =
  "w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

/** T24 - AC17: minimal current/receiving manager confirm/decline/return action. */
export function ManagerDecisionPanel({ requestId, onDecided }: { requestId: string; onDecided: () => void }) {
  const [actor] = useActor();
  const [managerRole, setManagerRole] = useState<"current" | "receiving">("current");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function decide(decision: "confirm" | "decline" | "return") {
    setError(null);
    if ((decision === "decline" || decision === "return") && !reason) {
      setError("A reason is required to decline or return a request");
      return;
    }
    setBusy(true);
    try {
      await transfersApi.managerDecision(actor, requestId, { managerRole, decision, reason: reason || null });
      onDecided();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.body.error ?? "Failed" : "Failed to record decision");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-sm font-semibold text-slate-900">Manager decision</CardHeader>
      <CardBody className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Acting as
          <select className={selectClasses} value={managerRole} onChange={(e) => setManagerRole(e.target.value as "current" | "receiving")}>
            <option value="current">Current manager</option>
            <option value="receiving">Receiving manager</option>
          </select>
        </label>
        <textarea
          className={textareaClasses}
          rows={2}
          placeholder="Reason (required for decline/return)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => decide("confirm")}>
            Confirm
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => decide("return")}>
            Return for amendment
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => decide("decline")}>
            Decline
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
