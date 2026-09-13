import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("Withdraw & amend (T19)", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "withdrawAmend");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  it("AC28: employee can withdraw before the organisational record is updated", async () => {
    const employeeId = "emp-wa-001";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app).post(`/api/transfers/${created.body.requestId}/withdraw`).set("x-actor-id", employeeId);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Withdrawn");
  });

  it("AC28: withdrawal after organisational update requires HR", async () => {
    const employeeId = "emp-wa-002";
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
    await request(app)
      .post(`/api/transfers/${created.body.requestId}/hr-decision`)
      .set("x-actor-id", "hr-1")
      .set("x-actor-role", "HR")
      .send({ decision: "eligible" });

    const res = await request(app).post(`/api/transfers/${created.body.requestId}/withdraw`).set("x-actor-id", employeeId);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("WITHDRAWAL_REQUIRES_HR");
  });

  it("only the requester can withdraw their own request", async () => {
    const employeeId = "emp-wa-003";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const res = await request(app).post(`/api/transfers/${created.body.requestId}/withdraw`).set("x-actor-id", "someone-else");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });

  it("AC29: amendment allowed only in Returned for Amendment", async () => {
    const employeeId = "emp-wa-004";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    // still "Submitted" - amendment should be rejected
    const rejected = await request(app)
      .post(`/api/transfers/${created.body.requestId}/amend`)
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptA, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(rejected.status).toBe(409);
  });

  it("AC29: successful amendment while Returned for Amendment resubmits the request", async () => {
    const employeeId = "emp-wa-005";
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
      .send({ managerRole: "current", decision: "return", reason: "Please pick a different location" });

    const amended = await request(app)
      .post(`/api/transfers/${created.body.requestId}/amend`)
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationA, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(amended.status).toBe(200);
    expect(amended.body.status).toBe("Submitted");

    const fetched = await request(app).get(`/api/transfers/${created.body.requestId}`).set("x-actor-id", employeeId);
    expect(fetched.body.proposed.locationId).toBe(ref.locationA);
  });
});
