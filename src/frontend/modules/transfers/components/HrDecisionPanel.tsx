import { useState } from "react";
import { useActor } from "../../../shared/hooks/useActor";
import { ApiClientError } from "../../../shared/services/apiClient";
import { Button } from "../../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../../shared/components/Card";
import { transfersApi } from "../services/transfersApi";

const textareaClasses =
  "w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

/** T24 - AC22: minimal HR eligibility decision action. */
export function HrDecisionPanel({ requestId, onDecided }: { requestId: string; onDecided: () => void }) {
  const [actor] = useActor();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function decide(decision: "eligible" | "not_eligible" | "eligible_with_conditions") {
    setError(null);
    if (decision === "not_eligible" && !reason) {
      setError("A reason is required when rejecting on eligibility grounds");
      return;
    }
    setBusy(true);
    try {
      await transfersApi.hrDecision(actor, requestId, { decision, reason: reason || null });
      onDecided();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.body.error ?? "Failed" : "Failed to record decision");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-sm font-semibold text-slate-900">HR eligibility decision</CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs text-slate-500">Requires x-actor-role: HR (set the role above).</p>
        <textarea
          className={textareaClasses}
          rows={2}
          placeholder="Reason (required if rejecting)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => decide("eligible")}>
            Eligible
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => decide("eligible_with_conditions")}>
            Eligible with conditions
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => decide("not_eligible")}>
            Not eligible
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
