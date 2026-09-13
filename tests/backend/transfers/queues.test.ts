import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("Queue endpoints - Approvals and HR Review tabs", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "queues");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  it("GET /api/transfers/queues/manager-approvals lists requests awaiting this manager", async () => {
    const employeeId = "emp-q-001";
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app).get("/api/transfers/queues/manager-approvals").set("x-actor-id", managerId);
    expect(res.status).toBe(200);
    expect(res.body.items.some((i: { requestId: string }) => i.requestId === created.body.requestId)).toBe(true);
  });

  it("drops a request from the manager queue once that manager has confirmed", async () => {
    const employeeId = "emp-q-002";
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
      .send({ managerRole: "current", decision: "confirm" });

    const res = await request(app).get("/api/transfers/queues/manager-approvals").set("x-actor-id", managerId);
    expect(res.body.items.some((i: { requestId: string }) => i.requestId === created.body.requestId)).toBe(false);
  });

  it("GET /api/transfers/queues/hr-review lists requests awaiting HR eligibility decision", async () => {
    const employeeId = "emp-q-003";
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
      .send({ managerRole: "current", decision: "confirm" });

    const res = await request(app).get("/api/transfers/queues/hr-review").set("x-actor-id", "hr-1").set("x-actor-role", "HR");
    expect(res.status).toBe(200);
    expect(res.body.items.some((i: { requestId: string }) => i.requestId === created.body.requestId)).toBe(true);
  });

  it("requires the HR role for the HR review queue", async () => {
    const res = await request(app).get("/api/transfers/queues/hr-review").set("x-actor-id", "not-hr");
    expect(res.status).toBe(403);
  });
});
