import type { PrismaClient, TransferRequest, FulfilmentTask, ManagerDecision, HrDecision } from "@prisma/client";

const OPEN_STATUSES = [
  "SUBMITTED",
  "MANAGER_CONFIRMED",
  "RETURNED_FOR_AMENDMENT",
  "UNDER_HR_REVIEW",
  "APPROVED_IN_PROGRESS",
  "ON_HOLD",
] as const;

export class TransferRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findDepartment(id: string) {
    return this.prisma.department.findUnique({ where: { id } });
  }

  findLocation(id: string) {
    return this.prisma.location.findUnique({ where: { id } });
  }

  findRole(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  findOpenRequestForEmployee(employeeId: string): Promise<TransferRequest | null> {
    return this.prisma.transferRequest.findFirst({
      where: { employeeId, status: { in: [...OPEN_STATUSES] } },
    });
  }

  create(data: {
    employeeId: string;
    currentDepartmentId: string;
    currentLocationId: string;
    currentRoleId: string;
    proposedDepartmentId: string;
    proposedLocationId: string;
    proposedRoleId: string;
    effectiveDate: Date;
    reason: string | null;
    assignedManagerId: string | null;
    receivingManagerId: string | null;
  }): Promise<TransferRequest> {
    return this.prisma.transferRequest.create({
      data: {
        employeeId: data.employeeId,
        currentDepartmentId: data.currentDepartmentId,
        currentLocationId: data.currentLocationId,
        currentRoleId: data.currentRoleId,
        proposedDepartmentId: data.proposedDepartmentId,
        proposedLocationId: data.proposedLocationId,
        proposedRoleId: data.proposedRoleId,
        effectiveDate: data.effectiveDate,
        reason: data.reason,
        status: "SUBMITTED",
        submittedAt: new Date(),
        assignedManagerId: data.assignedManagerId,
        receivingManagerId: data.receivingManagerId,
      },
    });
  }

  findById(id: string): Promise<TransferRequest | null> {
    return this.prisma.transferRequest.findUnique({ where: { id } });
  }

  findByEmployee(employeeId: string): Promise<TransferRequest[]> {
    return this.prisma.transferRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Requests where `actorId` is the current or receiving manager and hasn't confirmed yet. */
  findPendingManagerDecisions(actorId: string): Promise<TransferRequest[]> {
    return this.prisma.transferRequest.findMany({
      where: {
        status: "SUBMITTED",
        OR: [
          {
            assignedManagerId: actorId,
            managerDecisions: { none: { managerRole: "CURRENT", managerId: actorId, decision: "CONFIRM" } },
          },
          {
            receivingManagerId: actorId,
            managerDecisions: { none: { managerRole: "RECEIVING", managerId: actorId, decision: "CONFIRM" } },
          },
        ],
      },
      orderBy: { submittedAt: "asc" },
    });
  }

  /** Requests currently awaiting an HR eligibility decision. */
  findPendingHrReview(): Promise<TransferRequest[]> {
    return this.prisma.transferRequest.findMany({
      where: { status: "UNDER_HR_REVIEW" },
      orderBy: { submittedAt: "asc" },
    });
  }

  updateStatus(id: string, status: TransferRequest["status"]): Promise<TransferRequest> {
    return this.prisma.transferRequest.update({ where: { id }, data: { status } });
  }

  update(id: string, data: Partial<TransferRequest>): Promise<TransferRequest> {
    return this.prisma.transferRequest.update({ where: { id }, data });
  }

  createManagerDecision(data: {
    requestId: string;
    managerRole: "CURRENT" | "RECEIVING";
    managerId: string;
    decision: "CONFIRM" | "DECLINE" | "RETURN";
    reason: string | null;
  }): Promise<ManagerDecision> {
    return this.prisma.managerDecision.create({ data });
  }

  findManagerDecisions(requestId: string): Promise<ManagerDecision[]> {
    return this.prisma.managerDecision.findMany({ where: { requestId } });
  }

  createHrDecision(data: {
    requestId: string;
    decision: "ELIGIBLE" | "NOT_ELIGIBLE" | "ELIGIBLE_WITH_CONDITIONS";
    reason: string | null;
    conditions: string | null;
  }): Promise<HrDecision> {
    return this.prisma.hrDecision.create({ data });
  }

  findHrDecision(requestId: string): Promise<HrDecision | null> {
    return this.prisma.hrDecision.findUnique({ where: { requestId } });
  }

  findFulfilmentTasks(requestId: string): Promise<FulfilmentTask[]> {
    return this.prisma.fulfilmentTask.findMany({ where: { requestId } });
  }

  findFulfilmentTask(requestId: string, taskType: FulfilmentTask["taskType"]): Promise<FulfilmentTask | null> {
    return this.prisma.fulfilmentTask.findUnique({
      where: { requestId_taskType: { requestId, taskType } },
    });
  }

  markNotApplicable(requestId: string, taskType: FulfilmentTask["taskType"]): Promise<FulfilmentTask> {
    return this.prisma.fulfilmentTask.upsert({
      where: { requestId_taskType: { requestId, taskType } },
      create: { requestId, taskType, status: "NOT_APPLICABLE" },
      update: {},
    });
  }

  updateFulfilmentTaskStatus(
    requestId: string,
    taskType: FulfilmentTask["taskType"],
    status: FulfilmentTask["status"],
    note: string | null
  ): Promise<FulfilmentTask> {
    return this.prisma.fulfilmentTask.update({
      where: { requestId_taskType: { requestId, taskType } },
      data: { status, note },
    });
  }
}
