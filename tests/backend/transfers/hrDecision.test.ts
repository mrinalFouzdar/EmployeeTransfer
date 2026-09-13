import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("POST /api/transfers/:id/hr-decision (T12)", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "hrDecision");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  async function createAndConfirm(employeeId: string) {
    const managerId = `mgr-${employeeId}`;
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { managerId });
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);
    return { requestId: created.body.requestId as string, managerId };
  }

  it("AC21: HR cannot decide before manager confirmation", async () => {
    const { requestId } = await createAndConfirm("emp-hr-001");
    const res = await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "eligible" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("MANAGER_CONFIRMATION_PENDING");
  });

  it("AC22: HR not_eligible requires a reason and rejects the request", async () => {
    const { requestId, managerId } = await createAndConfirm("emp-hr-002");
    await request(app)
      .post(`/api/transfers/${requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });

    const missingReason = await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "not_eligible" });
    expect(missingReason.status).toBe(400);
    expect(missingReason.body.error).toBe("REASON_REQUIRED");

    const res = await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "not_eligible", reason: "Headcount not funded in receiving unit" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Rejected");
  });

  it("AC22: HR eligible proceeds to organisational update / downstream orchestration", async () => {
    const { requestId, managerId } = await createAndConfirm("emp-hr-003");
    await request(app)
      .post(`/api/transfers/${requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });

    const res = await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "eligible" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Approved - In Progress");
  });

  it("rejects a caller without the HR role", async () => {
    const { requestId, managerId } = await createAndConfirm("emp-hr-004");
    await request(app)
      .post(`/api/transfers/${requestId}/manager-decision`)
      .set("x-actor-id", managerId)
      .send({ managerRole: "current", decision: "confirm" });

    const res = await request(app)
      .post(`/api/transfers/${requestId}/hr-decision`)
      .set("x-actor-id", "not-hr")
      .send({ decision: "eligible" });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });
});
