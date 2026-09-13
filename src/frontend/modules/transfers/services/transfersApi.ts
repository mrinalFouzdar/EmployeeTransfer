import { apiClient, ActorHeaders } from "../../../shared/services/apiClient";

export interface CreateTransferRequestPayload {
  departmentId: string;
  locationId: string;
  roleId: string;
  effectiveDate: string;
  reason?: string | null;
  receivingManagerId?: string | null;
}

export interface TransferRequestSummary {
  requestId: string;
  status: string;
  effectiveDate: string;
  submittedAt: string | null;
}

export interface QueueItem {
  requestId: string;
  employeeId: string;
  status: string;
  effectiveDate: string;
  submittedAt: string | null;
}

export interface TransferRequestView {
  requestId: string;
  status: string;
  current: { departmentId: string; locationId: string; roleId: string };
  proposed: { departmentId: string; locationId: string; roleId: string };
  effectiveDate: string;
  reason: string | null;
  pendingAction: { stakeholder: string | null; pendingSince: string | null };
  history: Array<{ actor: string; action: string; timestamp: string }>;
}

export const transfersApi = {
  create: (actor: ActorHeaders, payload: CreateTransferRequestPayload) =>
    apiClient.post<{ requestId: string; status: string; submittedAt: string }>("/transfers", actor, payload),

  get: (actor: ActorHeaders, requestId: string) => apiClient.get<TransferRequestView>(`/transfers/${requestId}`, actor),

  list: (actor: ActorHeaders) => apiClient.get<{ requests: TransferRequestSummary[] }>("/transfers", actor),

  pendingManagerApprovals: (actor: ActorHeaders) => apiClient.get<{ items: QueueItem[] }>("/transfers/queues/manager-approvals", actor),

  pendingHrReview: (actor: ActorHeaders) => apiClient.get<{ items: QueueItem[] }>("/transfers/queues/hr-review", actor),

  withdraw: (actor: ActorHeaders, requestId: string) =>
    apiClient.post<{ requestId: string; status: string }>(`/transfers/${requestId}/withdraw`, actor),

  amend: (actor: ActorHeaders, requestId: string, payload: CreateTransferRequestPayload) =>
    apiClient.post<{ requestId: string; status: string }>(`/transfers/${requestId}/amend`, actor, payload),

  managerDecision: (
    actor: ActorHeaders,
    requestId: string,
    payload: { managerRole: "current" | "receiving"; decision: "confirm" | "decline" | "return"; reason?: string | null }
  ) => apiClient.post<{ requestId: string; status: string }>(`/transfers/${requestId}/manager-decision`, actor, payload),

  hrDecision: (
    actor: ActorHeaders,
    requestId: string,
    payload: { decision: "eligible" | "not_eligible" | "eligible_with_conditions"; reason?: string | null; conditions?: string | null }
  ) => apiClient.post<{ requestId: string; status: string }>(`/transfers/${requestId}/hr-decision`, actor, payload),
};
