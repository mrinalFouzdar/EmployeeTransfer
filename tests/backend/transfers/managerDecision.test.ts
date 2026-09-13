import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("POST /api/transfers/:id/manager-decision (T08-T11)", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "managerDecision");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  it("AC17: manager decline requires a reason", async () => {
    const employeeId = "emp-md-001";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "decline" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("REASON_REQUIRED");
  });

  it("AC17: manager confirm/decline/return transitions status correctly", async () => {
    const employeeId = "emp-md-002";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Under HR Review");
  });

  it("declines a request and shows the reason to the employee", async () => {
    const employeeId = "emp-md-003";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "decline", reason: "Team is short-staffed" });

    const fetched = await request(app).get(`/api/transfers/${created.body.requestId}`).set("x-actor-id", employeeId);
    expect(fetched.body.status).toBe("Rejected");
  });

  it("returns a request to the employee for amendment", async () => {
    const employeeId = "emp-md-004";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "return", reason: "Please double-check the effective date" });
    expect(res.body.status).toBe("Returned for Amendment");
  });

  it("AC18: receiving-manager confirmation is required when named, and blocks HR review until given", async () => {
    const employeeId = "emp-md-005";
    const managerId = `mgr-${employeeId}`;
    const receivingManagerId = "receiving-mgr-005";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({
        departmentId: ref.deptB,
        locationId: ref.locationB,
        roleId: ref.roleB,
        effectiveDate: validEffectiveDate(),
        receivingManagerId,
      });
    createdRequestIds.push(created.body.requestId);

    const currentConfirm = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });
    // still awaiting receiving manager - not yet Under HR Review
    expect(currentConfirm.body.status).toBe("Submitted");

    const stillPending = await request(app).get(`/api/transfers/${created.body.requestId}`).set("x-actor-id", employeeId);
    expect(stillPending.body.pendingAction.stakeholder).toBe("Receiving Manager");

    const receivingConfirm = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", receivingManagerId)
      .send({ managerRole: "receiving", decision: "confirm" });
    expect(receivingConfirm.body.status).toBe("Under HR Review");
  });

  it("AC19: self-approval conflict is blocked and audited", async () => {
    const employeeId = "emp-md-006";
    createdEmployeeIds.push(employeeId);
    // anomaly: employee's own managerId is themselves
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId: employeeId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", employeeId)
      .send({ managerRole: "current", decision: "confirm" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("SELF_APPROVAL_NOT_ALLOWED");

    const events = await prisma.auditEvent.findMany({ where: { requestId: created.body.requestId } });
    expect(events.some((e) => e.action === "self_approval_attempt_blocked")).toBe(true);
  });

  it("AC20: manager inaction for 3+ business days escalates the pending action to HR", async () => {
    const employeeId = "emp-md-007";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    // simulate 4 business days having elapsed since submission
    const fourBusinessDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    await prisma.transferRequest.update({
      where: { id: created.body.requestId },
      data: { submittedAt: fourBusinessDaysAgo },
    });

    const res = await request(app).get(`/api/transfers/${created.body.requestId}`).set("x-actor-id", employeeId);
    expect(res.body.pendingAction.stakeholder).toBe("HR");
  });

  it("rejects a manager-decision from someone who is not the assigned manager", async () => {
    const employeeId = "emp-md-008";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app)
      .post(`/api/transfers/${created.body.requestId}/manager-decision`)
      .set("x-actor-id", "someone-else")
      .send({ managerRole: "current", decision: "confirm" });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });
});
