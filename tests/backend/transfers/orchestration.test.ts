import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("Downstream orchestration (T13-T18)", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "orchestration");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  async function createApprovedRequest(
    employeeId: string,
    proposed: { departmentId: string; locationId: string; roleId: string }
  ) {
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ ...proposed, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);
    const requestId = created.body.requestId as string;

    await request(app)
      .post(`/api/transfers/${requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });
    await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "eligible" });

    return requestId;
  }

  it("AC23: downstream tasks are not raised before HR approval", async () => {
    const employeeId = "emp-orch-001";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const preHr = await request(app)
      .post(`/api/transfers/${created.body.requestId}/fulfilment-tasks/it/status`)
      .set("x-actor-id", "it-ops")
      .send({ status: "complete" });
    expect(preHr.status).toBe(400);
    expect(preHr.body.error).toBe("TASK_NOT_YET_RAISED");
  });

  it("AC24: only applicable tasks are raised, in parallel (location-only change -> Facilities only)", async () => {
    const employeeId = "emp-orch-002";
    const requestId = await createApprovedRequest(employeeId, {
      departmentId: ref.deptA, // unchanged
      locationId: ref.locationB, // changed
      roleId: ref.roleA, // unchanged
    });

    const tasks = await prisma.fulfilmentTask.findMany({ where: { requestId } });
    const byType = Object.fromEntries(tasks.map((t) => [t.taskType, t]));
    expect(byType.FACILITIES.status).toBe("IN_PROGRESS");
    expect(byType.PAYROLL?.status ?? "NOT_APPLICABLE").toBe("NOT_APPLICABLE");
    expect(byType.IT?.status ?? "NOT_APPLICABLE").toBe("NOT_APPLICABLE");
  });

  it("AC24/AC25: department+role change raises Payroll and IT with the access-timing note", async () => {
    const employeeId = "emp-orch-003";
    const requestId = await createApprovedRequest(employeeId, {
      departmentId: ref.deptB,
      locationId: ref.locationA,
      roleId: ref.roleB,
    });

    const tasks = await prisma.fulfilmentTask.findMany({ where: { requestId } });
    const byType = Object.fromEntries(tasks.map((t) => [t.taskType, t]));
    expect(byType.PAYROLL.status).toBe("IN_PROGRESS");
    expect(byType.IT.status).toBe("IN_PROGRESS");
    expect(byType.IT.note).toMatch(/Do not revoke existing access/);
    expect(byType.FACILITIES?.status ?? "NOT_APPLICABLE").toBe("NOT_APPLICABLE");
  });

  it("AC26: request does not complete while a task is still outstanding", async () => {
    const employeeId = "emp-orch-004";
    const requestId = await createApprovedRequest(employeeId, { departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB });

    await request(app).post(`/api/transfers/${requestId}/fulfilment-tasks/payroll/status`).set("x-actor-id", "payroll-ops").send({ status: "complete" });
    await request(app).post(`/api/transfers/${requestId}/fulfilment-tasks/it/status`).set("x-actor-id", "it-ops").send({ status: "complete" });

    const view = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(view.body.status).toBe("Approved - In Progress");
  });

  it("AC26: a failed downstream task moves the request to On Hold and notifies HR", async () => {
    const employeeId = "emp-orch-005";
    const requestId = await createApprovedRequest(employeeId, { departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB });

    const res = await request(app)
      .post(`/api/transfers/${requestId}/fulfilment-tasks/it/status`)
      .set("x-actor-id", "it-ops")
      .send({ status: "failed", note: "Access system outage" });
    expect(res.status).toBe(200);

    const view = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(view.body.status).toBe("On Hold");
  });

  it("AC27: completion of all applicable tasks moves the request to Completed with a consolidated confirmation", async () => {
    const employeeId = "emp-orch-006";
    const requestId = await createApprovedRequest(employeeId, { departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB });

    await request(app).post(`/api/transfers/${requestId}/fulfilment-tasks/payroll/status`).set("x-actor-id", "payroll-ops").send({ status: "complete" });
    await request(app).post(`/api/transfers/${requestId}/fulfilment-tasks/it/status`).set("x-actor-id", "it-ops").send({ status: "complete" });
    const last = await request(app)
      .post(`/api/transfers/${requestId}/fulfilment-tasks/facilities/status`)
      .set("x-actor-id", "facilities-ops")
      .send({ status: "complete" });
    expect(last.status).toBe(200);

    const view = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(view.body.status).toBe("Completed");
    expect(view.body.pendingAction.stakeholder).toBeNull();
  });
});
