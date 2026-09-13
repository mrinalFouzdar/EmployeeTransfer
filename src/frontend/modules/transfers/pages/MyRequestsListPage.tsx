import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useActor } from "../../../shared/hooks/useActor";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { transfersApi, TransferRequestSummary } from "../services/transfersApi";

const HISTORY_STATUSES = new Set(["Completed", "Rejected", "Withdrawn"]);

type SubTab = "active" | "history";

const SUB_TABS: Array<{ key: SubTab; label: string }> = [
  { key: "active", label: "Active" },
  { key: "history", label: "History" },
];

/** Lightweight landing page - not a numbered task on its own, but the natural entry point
 * tying RequestFormPage (T22) and RequestTrackerPage (T23) together for real use.
 * Active/History is a secondary tab level nested inside the "My Requests" top-level tab. */
export function MyRequestsListPage() {
  const [actor] = useActor();
  const [requests, setRequests] = useState<TransferRequestSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>("active");

  useEffect(() => {
    if (!actor.id) return;
    transfersApi
      .list(actor)
      .then((res) => setRequests(res.requests))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load requests"));
  }, [actor.id]);

  const { active, history } = useMemo(() => {
    const active: TransferRequestSummary[] = [];
    const history: TransferRequestSummary[] = [];
    for (const r of requests) {
      (HISTORY_STATUSES.has(r.status) ? history : active).push(r);
    }
    return { active, history };
  }, [requests]);

  const visible = subTab === "active" ? active : history;

  if (!actor.id) return <p className="text-sm text-slate-500">Set an actor id above to see your requests.</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">My Transfer Requests</h1>
        <Link to="/new">
          <Button>New request</Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              subTab === tab.key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-slate-400">{tab.key === "active" ? active.length : history.length}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {visible.length === 0 ? (
        <Card className="px-5 py-10 text-center text-sm text-slate-500">
          <p>{subTab === "active" ? "No active requests." : "No completed or closed requests yet."}</p>
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {visible.map((r) => (
            <Link
              key={r.requestId}
              to={`/requests/${r.requestId}`}
              className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-slate-50"
            >
              <span className="text-xs text-slate-500">Effective {new Date(r.effectiveDate).toLocaleDateString()}</span>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
