import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, seedEstablishedEmployee, cleanupEmployee, cleanupRequest, validEffectiveDate, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("GET /api/transfers/:id and /api/transfers (T07) - status & visibility", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "getRequest");
  });

  afterEach(async () => {
    while (createdRequestIds.length) await cleanupRequest(prisma, createdRequestIds.pop());
    while (createdEmployeeIds.length) await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  async function createRequestFor(employeeId: string) {
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(res.body.requestId);
    return res.body.requestId as string;
  }

  it("AC13: employee can view the current status of their request", async () => {
    const employeeId = "emp-gr-001";
    const requestId = await createRequestFor(employeeId);
    const res = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Submitted");
  });

  it("AC14: employee can view the pending stakeholder and since-when", async () => {
    const employeeId = "emp-gr-002";
    const requestId = await createRequestFor(employeeId);
    const res = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(res.body.pendingAction.stakeholder).toBe("Current Manager");
    expect(res.body.pendingAction.pendingSince).toBeTruthy();
  });

  it("AC15: internal commentary is never exposed to the employee", async () => {
    const employeeId = "emp-gr-003";
    const requestId = await createRequestFor(employeeId);
    const res = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(res.body.commentary).toBeUndefined();
    expect(res.body.internalNotes).toBeUndefined();
  });

  it("AC16: salary/remuneration detail is never exposed to the employee", async () => {
    const employeeId = "emp-gr-004";
    const requestId = await createRequestFor(employeeId);
    const res = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", employeeId);
    expect(res.body.salary).toBeUndefined();
    expect(res.body.remuneration).toBeUndefined();
  });

  it("returns 404 for a non-existent request", async () => {
    const res = await request(app).get("/api/transfers/no-such-id").set("x-actor-id", "someone");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });

  it("returns 403 when the caller is not the requester or an authorised stakeholder", async () => {
    const employeeId = "emp-gr-005";
    const requestId = await createRequestFor(employeeId);
    const res = await request(app).get(`/api/transfers/${requestId}`).set("x-actor-id", "unrelated-person");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });

  it("GET /api/transfers/my-profile returns the caller's current department/location/role (AC12)", async () => {
    const employeeId = "emp-gr-007";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const res = await request(app).get("/api/transfers/my-profile").set("x-actor-id", employeeId);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      employeeId,
      name: null,
      currentDepartmentId: ref.deptA,
      currentLocationId: ref.locationA,
      currentRoleId: ref.roleA,
    });
  });

  it("GET /api/transfers lists the employee's own requests", async () => {
    const employeeId = "emp-gr-006";
    await createRequestFor(employeeId);
    const res = await request(app).get("/api/transfers").set("x-actor-id", employeeId);
    expect(res.status).toBe(200);
    expect(res.body.requests.length).toBe(1);
    expect(res.body.requests[0].status).toBe("Submitted");
  });
});
