import type { TransferRequest, FulfilmentTaskType, FulfilmentTaskStatus } from "@prisma/client";
import { ApiError } from "../../../shared/errors/ApiError";
import { TransferRepository } from "../repositories/TransferRepository";
import { EmployeeProfileProvider } from "./EmployeeProfileProvider";
import { FulfilmentTaskGateway, FulfilmentTaskTypeName } from "./FulfilmentTaskGateway";
import { NotificationGateway } from "./NotificationGateway";
import { AuditService } from "./AuditService";
import {
  CreateTransferRequestInput,
  ManagerDecisionInput,
  HrDecisionInput,
  FulfilmentTaskStatusInput,
} from "../validators/transferValidators";
import { addDays, businessDaysBetween, isBeforeNextPayrollCutoff } from "../utils/businessDate";

const MIN_LEAD_TIME_DAYS = 28; // BR-10: 4 weeks
const ESCALATION_BUSINESS_DAYS = 3; // BR-18

const STATUS_DISPLAY: Record<TransferRequest["status"], string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  MANAGER_CONFIRMED: "Manager Confirmed",
  RETURNED_FOR_AMENDMENT: "Returned for Amendment",
  UNDER_HR_REVIEW: "Under HR Review",
  APPROVED_IN_PROGRESS: "Approved - In Progress",
  PENDING_ACTION: "Pending Action",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const TASK_TYPE_DISPLAY: Record<FulfilmentTaskType, string> = {
  PAYROLL: "Payroll",
  IT: "IT",
  FACILITIES: "Facilities",
};

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

export interface QueueItem {
  requestId: string;
  employeeId: string;
  status: string;
  effectiveDate: string;
  submittedAt: string | null;
}

const OPEN_BEFORE_ORG_UPDATE: TransferRequest["status"][] = [
  "SUBMITTED",
  "MANAGER_CONFIRMED",
  "RETURNED_FOR_AMENDMENT",
  "UNDER_HR_REVIEW",
];

export class TransferService {
  constructor(
    private readonly repo: TransferRepository,
    private readonly profileProvider: EmployeeProfileProvider,
    private readonly gateway: FulfilmentTaskGateway,
    private readonly notifier: NotificationGateway,
    private readonly audit: AuditService
  ) {}

  async createRequest(employeeId: string, input: CreateTransferRequestInput): Promise<{ requestId: string; status: string; submittedAt: string }> {
    const profile = await this.profileProvider.getProfile(employeeId);
    if (!profile) {
      throw new ApiError(400, "VALIDATION_ERROR", { field: "employeeId" });
    }

    const [department, location, role] = await Promise.all([
      this.repo.findDepartment(input.departmentId),
      this.repo.findLocation(input.locationId),
      this.repo.findRole(input.roleId),
    ]);
    if (!department) throw new ApiError(400, "VALIDATION_ERROR", { field: "departmentId" });
    if (!location) throw new ApiError(400, "VALIDATION_ERROR", { field: "locationId" });
    if (!role) throw new ApiError(400, "VALIDATION_ERROR", { field: "roleId" });

    if (
      input.departmentId === profile.currentDepartmentId &&
      input.locationId === profile.currentLocationId &&
      input.roleId === profile.currentRoleId
    ) {
      throw new ApiError(400, "NO_CHANGE_REQUESTED");
    }

    const existingOpen = await this.repo.findOpenRequestForEmployee(employeeId);
    if (existingOpen) {
      throw new ApiError(409, "OPEN_REQUEST_EXISTS", { requestId: existingOpen.id });
    }

    if (!profile.isActive) {
      throw new ApiError(403, "NOT_ELIGIBLE", { reason: "Employee is not active (serving notice or has a pending exit)" });
    }
    if (profile.tenureMonths < 12) {
      throw new ApiError(403, "NOT_ELIGIBLE", { reason: "Minimum 12 months tenure in current role required" });
    }
    if (profile.isOnProbation && !profile.hasProbationException) {
      throw new ApiError(403, "NOT_ELIGIBLE", { reason: "Employee is on probation and has no recorded HR exception" });
    }
    if (profile.hasActiveDisciplinaryProcess && !profile.hasDisciplinaryOverride) {
      throw new ApiError(403, "NOT_ELIGIBLE", { reason: "Employee has an active disciplinary/performance process and no recorded HR override" });
    }
    if (profile.monthsSinceLastCompletedTransfer !== null && profile.monthsSinceLastCompletedTransfer < 12) {
      throw new ApiError(403, "NOT_ELIGIBLE", { reason: "Employee is within the 12-month post-transfer cooling-off period" });
    }

    const now = new Date();
    const effectiveDate = new Date(input.effectiveDate);
    if (Number.isNaN(effectiveDate.getTime()) || effectiveDate.getTime() < addDays(now, MIN_LEAD_TIME_DAYS).getTime()) {
      throw new ApiError(400, "INVALID_EFFECTIVE_DATE", {
        reason: `Effective date must be at least ${MIN_LEAD_TIME_DAYS} days from submission`,
      });
    }
    // BR-11 (resolved) describes *deferral* of the payroll-relevant change when the
    // effective date falls before the next cut-off, not rejection of the whole request -
    // org/access/facilities changes still happen on the requested date. That deferral is
    // applied later, when the PAYROLL fulfilment task is raised (see recordHrDecision),
    // not here. (This corrects an inconsistency in this Spec's own AC4 exception table,
    // which had implied rejection; the resolved BR-11 text is unambiguous about deferral.)

    const selfApprovalAnomaly = profile.managerId === employeeId;
    const assignedManagerId = selfApprovalAnomaly ? null : profile.managerId;

    const created = await this.repo.create({
      employeeId,
      currentDepartmentId: profile.currentDepartmentId,
      currentLocationId: profile.currentLocationId,
      currentRoleId: profile.currentRoleId,
      proposedDepartmentId: input.departmentId,
      proposedLocationId: input.locationId,
      proposedRoleId: input.roleId,
      effectiveDate,
      reason: input.reason ?? null,
      assignedManagerId,
      receivingManagerId: input.receivingManagerId ?? null,
    });

    await this.audit.record({ requestId: created.id, actor: employeeId, action: "submitted" });
    if (selfApprovalAnomaly) {
      await this.audit.record({
        requestId: created.id,
        actor: "system",
        action: "self_approval_conflict_detected",
        reason: "Requester's assigned manager is themselves; routed to HR - no deeper org hierarchy available to auto-resolve a next-level manager",
      });
    }
    await this.notifier.notifyEmployee(employeeId, "submitted", { requestId: created.id });

    return { requestId: created.id, status: STATUS_DISPLAY[created.status], submittedAt: created.submittedAt!.toISOString() };
  }

  async getRequest(requestId: string, callerId: string): Promise<TransferRequestView> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new ApiError(404, "NOT_FOUND");

    const isAuthorised =
      callerId === request.employeeId ||
      callerId === request.assignedManagerId ||
      callerId === request.receivingManagerId ||
      callerId === "hr";
    if (!isAuthorised) throw new ApiError(403, "FORBIDDEN");

    return this.toView(request);
  }

  async listRequests(employeeId: string): Promise<Array<{ requestId: string; status: string; effectiveDate: string; submittedAt: string | null }>> {
    const requests = await this.repo.findByEmployee(employeeId);
    return requests.map((r) => ({
      requestId: r.id,
      status: STATUS_DISPLAY[r.status],
      effectiveDate: r.effectiveDate.toISOString(),
      submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
    }));
  }

  /** Queue for the "Approvals" tab - requests waiting on `actorId` as a manager. */
  async listPendingManagerDecisions(actorId: string): Promise<QueueItem[]> {
    const requests = await this.repo.findPendingManagerDecisions(actorId);
    return requests.map((r) => this.toQueueItem(r));
  }

  /** Queue for the "HR Review" tab - all requests currently awaiting an HR decision. */
  async listPendingHrReview(): Promise<QueueItem[]> {
    const requests = await this.repo.findPendingHrReview();
    return requests.map((r) => this.toQueueItem(r));
  }

  async withdraw(requestId: string, employeeId: string): Promise<{ requestId: string; status: string }> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new ApiError(404, "NOT_FOUND");
    if (request.employeeId !== employeeId) throw new ApiError(403, "FORBIDDEN");
    if (!OPEN_BEFORE_ORG_UPDATE.includes(request.status)) {
      throw new ApiError(409, "WITHDRAWAL_REQUIRES_HR", {
        message: "Organisational record has already been updated; self-service withdrawal is no longer available",
      });
    }
    const updated = await this.repo.updateStatus(requestId, "WITHDRAWN");
    await this.audit.record({ requestId, actor: employeeId, action: "withdrawn" });
    await this.notifier.notifyEmployee(employeeId, "withdrawn", { requestId });
    return { requestId: updated.id, status: STATUS_DISPLAY[updated.status] };
  }

  /**
   * BR-14/AC29. Not in this Spec's original API Contract (API01-API07 never defined an
   * amend endpoint despite the AC requiring the capability) - added as an extension,
   * same pattern as the receivingManagerId gap in createRequest.
   */
  async amend(requestId: string, employeeId: string, input: CreateTransferRequestInput): Promise<{ requestId: string; status: string }> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new ApiError(404, "NOT_FOUND");
    if (request.employeeId !== employeeId) throw new ApiError(403, "FORBIDDEN");
    if (request.status !== "RETURNED_FOR_AMENDMENT" && request.status !== "DRAFT") {
      throw new ApiError(409, "AMENDMENT_NOT_ALLOWED", { status: STATUS_DISPLAY[request.status] });
    }

    const [department, location, role] = await Promise.all([
      this.repo.findDepartment(input.departmentId),
      this.repo.findLocation(input.locationId),
      this.repo.findRole(input.roleId),
    ]);
    if (!department) throw new ApiError(400, "VALIDATION_ERROR", { field: "departmentId" });
    if (!location) throw new ApiError(400, "VALIDATION_ERROR", { field: "locationId" });
    if (!role) throw new ApiError(400, "VALIDATION_ERROR", { field: "roleId" });
    if (
      input.departmentId === request.currentDepartmentId &&
      input.locationId === request.currentLocationId &&
      input.roleId === request.currentRoleId
    ) {
      throw new ApiError(400, "NO_CHANGE_REQUESTED");
    }
    const effectiveDate = new Date(input.effectiveDate);
    if (Number.isNaN(effectiveDate.getTime()) || effectiveDate.getTime() < addDays(new Date(), MIN_LEAD_TIME_DAYS).getTime()) {
      throw new ApiError(400, "INVALID_EFFECTIVE_DATE", {
        reason: `Effective date must be at least ${MIN_LEAD_TIME_DAYS} days from submission`,
      });
    }

    const updated = await this.repo.update(requestId, {
      proposedDepartmentId: input.departmentId,
      proposedLocationId: input.locationId,
      proposedRoleId: input.roleId,
      effectiveDate,
      reason: input.reason ?? null,
      status: "SUBMITTED",
      submittedAt: new Date(),
    });
    await this.audit.record({ requestId, actor: employeeId, action: "amended" });
    return { requestId: updated.id, status: STATUS_DISPLAY[updated.status] };
  }

  async recordManagerDecision(
    requestId: string,
    actorId: string,
    input: ManagerDecisionInput
  ): Promise<{ requestId: string; status: string }> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new ApiError(404, "NOT_FOUND");

    if (actorId === request.employeeId) {
      await this.audit.record({
        requestId,
        actor: actorId,
        action: "self_approval_attempt_blocked",
        reason: "Manager is also the requester",
      });
      throw new ApiError(409, "SELF_APPROVAL_NOT_ALLOWED", { routedTo: "HR (no next-level manager resolvable)" });
    }

    const expectedManagerId = input.managerRole === "current" ? request.assignedManagerId : request.receivingManagerId;
    if (!expectedManagerId || actorId !== expectedManagerId) {
      throw new ApiError(403, "FORBIDDEN");
    }

    if ((input.decision === "decline" || input.decision === "return") && !input.reason) {
      throw new ApiError(400, "REASON_REQUIRED");
    }

    const decisionType = input.decision === "confirm" ? "CONFIRM" : input.decision === "decline" ? "DECLINE" : "RETURN";
    await this.repo.createManagerDecision({
      requestId,
      managerRole: input.managerRole === "current" ? "CURRENT" : "RECEIVING",
      managerId: actorId,
      decision: decisionType,
      reason: input.reason ?? null,
    });
    await this.audit.record({ requestId, actor: actorId, action: "manager_decision", decision: input.decision, reason: input.reason ?? undefined });

    if (input.decision === "decline") {
      const updated = await this.repo.updateStatus(requestId, "REJECTED");
      await this.notifier.notifyEmployee(request.employeeId, "rejected", { requestId, reason: input.reason });
      return { requestId, status: STATUS_DISPLAY[updated.status] };
    }
    if (input.decision === "return") {
      const updated = await this.repo.updateStatus(requestId, "RETURNED_FOR_AMENDMENT");
      await this.notifier.notifyEmployee(request.employeeId, "returned_for_amendment", { requestId, reason: input.reason });
      return { requestId, status: STATUS_DISPLAY[updated.status] };
    }

    // confirm: advance only once every required confirmation is in
    const decisions = await this.repo.findManagerDecisions(requestId);
    const currentConfirmed = decisions.some((d) => d.managerRole === "CURRENT" && d.decision === "CONFIRM");
    const receivingRequired = Boolean(request.receivingManagerId);
    const receivingConfirmed = decisions.some((d) => d.managerRole === "RECEIVING" && d.decision === "CONFIRM");

    if (currentConfirmed && (!receivingRequired || receivingConfirmed)) {
      const updated = await this.repo.updateStatus(requestId, "UNDER_HR_REVIEW");
      await this.notifier.notifyStakeholder("HR", "pending_eligibility_review", { requestId });
      return { requestId, status: STATUS_DISPLAY[updated.status] };
    }
    return { requestId, status: STATUS_DISPLAY[request.status] };
  }

  async recordHrDecision(requestId: string, actorId: string, input: HrDecisionInput): Promise<{ requestId: string; status: string }> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new ApiError(404, "NOT_FOUND");
    if (request.status !== "UNDER_HR_REVIEW") {
      throw new ApiError(409, "MANAGER_CONFIRMATION_PENDING");
    }
    if (input.decision === "not_eligible" && !input.reason) {
      throw new ApiError(400, "REASON_REQUIRED");
    }

    const decisionType =
      input.decision === "eligible" ? "ELIGIBLE" : input.decision === "not_eligible" ? "NOT_ELIGIBLE" : "ELIGIBLE_WITH_CONDITIONS";
    await this.repo.createHrDecision({
      requestId,
      decision: decisionType,
      reason: input.reason ?? null,
      conditions: input.conditions ?? null,
    });
    await this.audit.record({ requestId, actor: actorId, action: "hr_decision", decision: input.decision, reason: input.reason ?? undefined });

    if (input.decision === "not_eligible") {
      const updated = await this.repo.updateStatus(requestId, "REJECTED");
      await this.notifier.notifyEmployee(request.employeeId, "rejected", { requestId, reason: input.reason });
      return { requestId, status: STATUS_DISPLAY[updated.status] };
    }

    // Eligible / eligible-with-conditions: organisational record update + raise applicable tasks (BR-22/23/24)
    const applicable = this.applicableTasks(request);
    for (const taskType of applicable) {
      await this.gateway.raiseTask(requestId, taskType);
    }
    if (applicable.includes("IT")) {
      // BR-25/BR-26: access timing is enforced by whoever actually performs the IT change
      // (manual today, per ManualFulfilmentAdapter/Q20) - this system cannot see or gate a
      // real IAM action, so the constraint is communicated on the task rather than silently
      // assumed satisfied.
      await this.repo.updateFulfilmentTaskStatus(
        requestId,
        "IT",
        "IN_PROGRESS",
        `Do not revoke existing access before ${request.effectiveDate.toISOString().slice(0, 10)}; new access must be available on or before that date (BR-25/BR-26)`
      );
    }
    if (applicable.includes("PAYROLL") && isBeforeNextPayrollCutoff(new Date(), request.effectiveDate)) {
      // BR-11 deferral: pay-affecting change moves to the following payroll period; the
      // organisational/access/facilities changes are unaffected and still land on the
      // requested effective date (already handled above/elsewhere).
      await this.repo.updateFulfilmentTaskStatus(
        requestId,
        "PAYROLL",
        "IN_PROGRESS",
        "Deferred to next payroll period (BR-11) - effective date precedes the next payroll cut-off"
      );
    }
    for (const taskType of (["PAYROLL", "IT", "FACILITIES"] as FulfilmentTaskTypeName[]).filter((t) => !applicable.includes(t))) {
      // Bookkeeping only - does not go through the gateway, which is for raising real work.
      await this.repo.markNotApplicable(requestId, taskType);
    }

    const updated = await this.repo.updateStatus(requestId, "APPROVED_IN_PROGRESS");
    await this.notifier.notifyEmployee(request.employeeId, "approved_in_progress", { requestId });
    return { requestId, status: STATUS_DISPLAY[updated.status] };
  }

  async updateFulfilmentTaskStatus(
    requestId: string,
    taskTypeParam: string,
    input: FulfilmentTaskStatusInput
  ): Promise<{ requestId: string; taskType: string; status: string }> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new ApiError(404, "NOT_FOUND");

    const taskType = taskTypeParam.toUpperCase() as FulfilmentTaskType;
    if (!["PAYROLL", "IT", "FACILITIES"].includes(taskType)) {
      throw new ApiError(404, "NOT_FOUND");
    }

    const existing = await this.repo.findFulfilmentTask(requestId, taskType);
    if (!existing) {
      throw new ApiError(400, "TASK_NOT_YET_RAISED");
    }

    const newStatus = input.status.toUpperCase() as FulfilmentTaskStatus;
    const task = await this.repo.updateFulfilmentTaskStatus(requestId, taskType, newStatus, input.note ?? null);
    await this.audit.record({ requestId, actor: "system", action: `fulfilment_task_${input.status}`, decision: taskType });

    if (newStatus === "FAILED") {
      await this.repo.updateStatus(requestId, "ON_HOLD");
      await this.notifier.notifyStakeholder("HR", "fulfilment_task_failed", { requestId, taskType });
    } else if (newStatus === "COMPLETE") {
      const allTasks = await this.repo.findFulfilmentTasks(requestId);
      const outstanding = allTasks.filter((t) => t.status === "IN_PROGRESS");
      if (outstanding.length === 0 && request.status !== "COMPLETED") {
        await this.repo.updateStatus(requestId, "COMPLETED");
        await this.notifier.notifyEmployee(request.employeeId, "completed", {
          requestId,
          department: request.proposedDepartmentId,
          location: request.proposedLocationId,
          role: request.proposedRoleId,
          effectiveDate: request.effectiveDate.toISOString(),
        });
      }
    }

    return { requestId, taskType: TASK_TYPE_DISPLAY[taskType], status: task.status };
  }

  /** BR-18: escalate to HR after 3 business days of manager inaction. Called by a scheduler. */
  async runEscalationCheck(): Promise<{ escalated: string[] }> {
    const escalated: string[] = [];
    // Intentionally simple: real implementation would query only SUBMITTED requests via the
    // repository; exposed here so a scheduler/cron job (not yet wired - no infra decision
    // made for this) can invoke it. Escalation itself is reflected via toView()'s pendingAction
    // computation (business-days-elapsed check), not a separate status value.
    return { escalated };
  }

  private toQueueItem(request: TransferRequest): QueueItem {
    return {
      requestId: request.id,
      employeeId: request.employeeId,
      status: STATUS_DISPLAY[request.status],
      effectiveDate: request.effectiveDate.toISOString(),
      submittedAt: request.submittedAt ? request.submittedAt.toISOString() : null,
    };
  }

  private applicableTasks(request: TransferRequest): FulfilmentTaskTypeName[] {
    const tasks: FulfilmentTaskTypeName[] = [];
    const departmentOrRoleChanged =
      request.proposedDepartmentId !== request.currentDepartmentId || request.proposedRoleId !== request.currentRoleId;
    if (departmentOrRoleChanged) tasks.push("PAYROLL", "IT");
    if (request.proposedLocationId !== request.currentLocationId) tasks.push("FACILITIES");
    return tasks;
  }

  private async toView(request: TransferRequest): Promise<TransferRequestView> {
    const [decisions, hrDecision, tasks, auditEvents] = await Promise.all([
      this.repo.findManagerDecisions(request.id),
      this.repo.findHrDecision(request.id),
      this.repo.findFulfilmentTasks(request.id),
      Promise.resolve([]),
    ]);

    let stakeholder: string | null = null;
    if (request.status === "SUBMITTED") {
      const currentConfirmed = decisions.some((d) => d.managerRole === "CURRENT" && d.decision === "CONFIRM");
      const escalatedToHr =
        request.assignedManagerId === null ||
        (request.submittedAt !== null && businessDaysBetween(request.submittedAt, new Date()) >= ESCALATION_BUSINESS_DAYS && !currentConfirmed);
      if (escalatedToHr) stakeholder = "HR";
      else if (!currentConfirmed) stakeholder = "Current Manager";
      else stakeholder = "Receiving Manager";
    } else if (request.status === "RETURNED_FOR_AMENDMENT") {
      stakeholder = "Employee";
    } else if (request.status === "UNDER_HR_REVIEW") {
      stakeholder = "HR";
    } else if (request.status === "APPROVED_IN_PROGRESS") {
      const outstanding = tasks.filter((t) => t.status === "IN_PROGRESS").map((t) => TASK_TYPE_DISPLAY[t.taskType]);
      stakeholder = outstanding.length > 0 ? outstanding.join(", ") : null;
    } else if (request.status === "ON_HOLD") {
      stakeholder = "HR";
    }

    void hrDecision;
    void auditEvents;

    return {
      requestId: request.id,
      status: STATUS_DISPLAY[request.status],
      current: {
        departmentId: request.currentDepartmentId,
        locationId: request.currentLocationId,
        roleId: request.currentRoleId,
      },
      proposed: {
        departmentId: request.proposedDepartmentId,
        locationId: request.proposedLocationId,
        roleId: request.proposedRoleId,
      },
      effectiveDate: request.effectiveDate.toISOString(),
      reason: request.reason,
      pendingAction: { stakeholder, pendingSince: stakeholder ? request.updatedAt.toISOString() : null },
      history: [],
    };
  }
}
