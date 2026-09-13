import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { ConsoleNotificationGateway } from "../../../src/backend/modules/transfers/services/NotificationGateway";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("Audit trail & notifications (T20-T21)", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "auditNotify");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  it("AC30: every lifecycle transition is recorded as an audit event with actor/timestamp/decision/reason", async () => {
    const employeeId = "emp-an-001";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });

    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);
    const requestId = created.body.requestId as string;

    await request(app)
      .post(`/api/transfers/${requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm", reason: null });

    await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "eligible" });

    const events = await prisma.auditEvent.findMany({ where: { requestId }, orderBy: { timestamp: "asc" } });
    const actions = events.map((e) => e.action);
    expect(actions).toEqual(expect.arrayContaining(["submitted", "manager_decision", "hr_decision"]));

    const submitted = events.find((e) => e.action === "submitted")!;
    expect(submitted.actor).toBe(employeeId);
    expect(submitted.timestamp).toBeInstanceOf(Date);

    const managerEvent = events.find((e) => e.action === "manager_decision")!;
    expect(managerEvent.actor).toBe(managerId);
    expect(managerEvent.decision).toBe("confirm");

    const hrEvent = events.find((e) => e.action === "hr_decision")!;
    expect(hrEvent.actor).toBe("hr-1");
    expect(hrEvent.decision).toBe("eligible");
  });

  it("AC31: the employee is notified on submission, decision, and completion", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const employeeId = "emp-an-002";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });

    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);
    const requestId = created.body.requestId as string;

    await request(app)
      .post(`/api/transfers/${requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });

    const notifiedEvents = logSpy.mock.calls.map((call) => String(call[0]));
    expect(notifiedEvents.some((line) => line.includes(`notify:employee:${employeeId}`) && line.includes("submitted"))).toBe(true);
    expect(notifiedEvents.some((line) => line.includes("notify:stakeholder:HR") && line.includes("pending_eligibility_review"))).toBe(true);

    logSpy.mockRestore();
  });

  it("AC31: a stakeholder is notified when a downstream task fails", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const employeeId = "emp-an-003";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });

    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
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

    logSpy.mockClear();
    await request(app).post(`/api/transfers/${requestId}/fulfilment-tasks/it/status`).set("x-actor-id", "it-ops").send({ status: "failed" });

    const notifiedEvents = logSpy.mock.calls.map((call) => String(call[0]));
    expect(notifiedEvents.some((line) => line.includes("notify:stakeholder:HR") && line.includes("fulfilment_task_failed"))).toBe(true);
    logSpy.mockRestore();
  });
});

describe("ConsoleNotificationGateway (unit)", () => {
  it("logs employee notifications with the event name and detail", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const gateway = new ConsoleNotificationGateway();
    await gateway.notifyEmployee("emp-1", "submitted", { requestId: "req-1" });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("notify:employee:emp-1"), expect.objectContaining({ requestId: "req-1" }));
    logSpy.mockRestore();
  });

  it("logs stakeholder notifications with the event name and detail", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const gateway = new ConsoleNotificationGateway();
    await gateway.notifyStakeholder("HR", "pending_eligibility_review", { requestId: "req-1" });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("notify:stakeholder:HR"), expect.objectContaining({ requestId: "req-1" }));
    logSpy.mockRestore();
  });
});
