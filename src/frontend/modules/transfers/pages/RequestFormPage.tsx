import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActor } from "../../../shared/hooks/useActor";
import { ApiClientError } from "../../../shared/services/apiClient";
import { Button } from "../../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../../shared/components/Card";
import { useReferenceData } from "../hooks/useReferenceData";
import { useMyProfile } from "../hooks/useMyProfile";
import { validateDraftRequest, DraftRequest } from "../utils/validation";
import { transfersApi } from "../services/transfersApi";

const EMPTY_DRAFT: DraftRequest = { departmentId: "", locationId: "", roleId: "", effectiveDate: "", reason: "" };

const selectClasses =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const fieldErrorClasses = "mt-1 text-sm text-red-600";
const labelClasses = "block text-sm font-medium text-slate-700";

/** T22 - AC1-AC6: capture form with a client-side mirror of controlled-list/mandatory/
 * effective-date validation. The server remains the source of truth for all rules. */
export function RequestFormPage() {
  const [actor] = useActor();
  const navigate = useNavigate();
  const { departments, locations, roles, loading: refLoading, error: refError } = useReferenceData();
  const { profile, loading: profileLoading, error: profileError } = useMyProfile();

  const [draft, setDraft] = useState<DraftRequest>(EMPTY_DRAFT);
  const [clientErrors, setClientErrors] = useState<ReturnType<typeof validateDraftRequest>["errors"]>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!actor.id) {
    return <p className="text-sm text-slate-500">Set an actor id above to continue.</p>;
  }
  if (refLoading || profileLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }
  if (refError || profileError) {
    return <p className="text-sm text-red-600">{refError ?? profileError}</p>;
  }
  if (!profile) {
    return <p className="text-sm text-red-600">No employee profile found for actor "{actor.id}".</p>;
  }

  const controlledLists = {
    departmentIds: departments.map((d) => d.id),
    locationIds: locations.map((l) => l.id),
    roleIds: roles.map((r) => r.id),
  };
  const current = {
    departmentId: profile.currentDepartmentId,
    locationId: profile.currentLocationId,
    roleId: profile.currentRoleId,
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const result = validateDraftRequest(draft, controlledLists, current);
    setClientErrors(result.errors);
    if (!result.valid) return;

    setSubmitting(true);
    try {
      const res = await transfersApi.create(actor, {
        departmentId: draft.departmentId,
        locationId: draft.locationId,
        roleId: draft.roleId,
        effectiveDate: draft.effectiveDate,
        reason: draft.reason || null,
      });
      navigate(`/requests/${res.requestId}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.body.reason ? String(err.body.reason) : err.body.error ?? "Request failed");
      } else {
        setServerError("Request failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Internal Transfer Request</h1>

      <Card>
        <CardHeader className="text-xs font-medium uppercase tracking-wide text-slate-400">Current (read-only)</CardHeader>
        <CardBody className="space-y-1 text-sm text-slate-600">
          <p>Department: {departments.find((d) => d.id === current.departmentId)?.name ?? current.departmentId}</p>
          <p>Location: {locations.find((l) => l.id === current.locationId)?.name ?? current.locationId}</p>
          <p>Role: {roles.find((r) => r.id === current.roleId)?.name ?? current.roleId}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <label className="block">
            <span className={labelClasses}>Proposed department</span>
            <select
              className={selectClasses}
              value={draft.departmentId}
              onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}
            >
              <option value="">Select a department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {clientErrors.departmentId && <p className={fieldErrorClasses}>{clientErrors.departmentId}</p>}
          </label>

          <label className="block">
            <span className={labelClasses}>Proposed location</span>
            <select
              className={selectClasses}
              value={draft.locationId}
              onChange={(e) => setDraft({ ...draft, locationId: e.target.value })}
            >
              <option value="">Select a location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            {clientErrors.locationId && <p className={fieldErrorClasses}>{clientErrors.locationId}</p>}
          </label>

          <label className="block">
            <span className={labelClasses}>Proposed role</span>
            <select className={selectClasses} value={draft.roleId} onChange={(e) => setDraft({ ...draft, roleId: e.target.value })}>
              <option value="">Select a role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {clientErrors.roleId && <p className={fieldErrorClasses}>{clientErrors.roleId}</p>}
          </label>

          <label className="block">
            <span className={labelClasses}>Effective date</span>
            <input
              type="date"
              className={selectClasses}
              value={draft.effectiveDate ? draft.effectiveDate.slice(0, 10) : ""}
              onChange={(e) => setDraft({ ...draft, effectiveDate: e.target.value ? new Date(e.target.value).toISOString() : "" })}
            />
            {clientErrors.effectiveDate && <p className={fieldErrorClasses}>{clientErrors.effectiveDate}</p>}
          </label>

          <label className="block">
            <span className={labelClasses}>Reason (optional)</span>
            <textarea
              className={selectClasses}
              rows={3}
              value={draft.reason ?? ""}
              onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
            />
          </label>
        </CardBody>
      </Card>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
