import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import {
  seedRefData,
  cleanupRefData,
  seedEstablishedEmployee,
  cleanupEmployee,
  cleanupRequest,
  validEffectiveDate,
  monthsAgo,
  SeedRefData,
} from "./helpers/seed";

const app = createApp();

describe("POST /api/transfers (T03-T06) - capture & validation", () => {
  let ref: SeedRefData;
  const createdRequestIds: string[] = [];
  const createdEmployeeIds: string[] = [];

  beforeAll(async () => {
    ref = await seedRefData(prisma, "createRequest");
  });

  afterEach(async () => {
    while (createdRequestIds.length) {
      await cleanupRequest(prisma, createdRequestIds.pop());
    }
    while (createdEmployeeIds.length) {
      await cleanupEmployee(prisma, createdEmployeeIds.pop()!);
    }
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  it("AC1-3: rejects a department/location/role not in the controlled list", async () => {
    const employeeId = "emp-cr-001";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: "no-such-dept", locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "VALIDATION_ERROR", field: "departmentId" });
  });

  it("AC6: rejects a request missing a mandatory field", async () => {
    const employeeId = "emp-cr-002";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
    expect(res.body.field).toBe("effectiveDate");
  });

  it("AC5: accepts a request with reason omitted (optional)", async () => {
    const employeeId = "emp-cr-003";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(201);
    createdRequestIds.push(res.body.requestId);
  });

  it("AC4: rejects an effective date less than 4 weeks out", async () => {
    const employeeId = "emp-cr-004";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: soon });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_EFFECTIVE_DATE");
  });

  it("AC7: rejects a request with no actual change (BR-09)", async () => {
    const employeeId = "emp-cr-005";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptA, locationId: ref.locationA, roleId: ref.roleA, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("NO_CHANGE_REQUESTED");
  });

  it("AC8: rejects a second request while one is already open (BR-06)", async () => {
    const employeeId = "emp-cr-006";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const first = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(first.body.requestId);

    const second = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationA, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe("OPEN_REQUEST_EXISTS");
  });

  it("AC9: rejects an employee with less than 12 months tenure", async () => {
    const employeeId = "emp-cr-007";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { hireDate: monthsAgo(6) });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("NOT_ELIGIBLE");
  });

  it("AC10: rejects an employee on probation with no HR exception", async () => {
    const employeeId = "emp-cr-008";
    createdEmployeeIds.push(employeeId);
    // hireDate far enough back that the tenure rule (AC9) doesn't also fire - isolates the
    // probation rule specifically.
    await seedEstablishedEmployee(prisma, employeeId, ref, {
      hireDate: monthsAgo(24),
      probationEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      probationExceptionApproved: false,
    });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("NOT_ELIGIBLE");
  });

  it("AC10: accepts an employee on probation with a recorded HR exception", async () => {
    const employeeId = "emp-cr-009";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, {
      hireDate: monthsAgo(24),
      probationEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      probationExceptionApproved: true,
    });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(201);
    createdRequestIds.push(res.body.requestId);
  });

  it("AC11: rejects an employee within the 12-month cooling-off period", async () => {
    const employeeId = "emp-cr-010";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { lastTransferCompletedAt: monthsAgo(4) });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("NOT_ELIGIBLE");
  });

  it("AC32: rejects an employee who is not active (serving notice / pending exit)", async () => {
    const employeeId = "emp-cr-012";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, { hireDate: monthsAgo(24), isActive: false });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("NOT_ELIGIBLE");
  });

  it("AC33: rejects an employee with an active disciplinary process and no HR override", async () => {
    const employeeId = "emp-cr-013";
    createdEmployeeIds.push(employeeId);
    // hireDate far enough back that the tenure rule (AC9) doesn't also fire - isolates the
    // disciplinary rule specifically, same pattern as the AC10 probation tests above.
    await seedEstablishedEmployee(prisma, employeeId, ref, {
      hireDate: monthsAgo(24),
      hasActiveDisciplinaryProcess: true,
      disciplinaryOverrideApproved: false,
    });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("NOT_ELIGIBLE");
  });

  it("AC33: accepts an employee with an active disciplinary process when HR has recorded an override", async () => {
    const employeeId = "emp-cr-014";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref, {
      hireDate: monthsAgo(24),
      hasActiveDisciplinaryProcess: true,
      disciplinaryOverrideApproved: true,
    });
    const res = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    expect(res.status).toBe(201);
    createdRequestIds.push(res.body.requestId);
  });

  it("AC12: current department/location/role are system-populated, not accepted from the client", async () => {
    const employeeId = "emp-cr-011";
    createdEmployeeIds.push(employeeId);
    await seedEstablishedEmployee(prisma, employeeId, ref);
    const created = await request(app)
      .post("/api/transfers")
      .set("x-actor-id", employeeId)
      .send({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB, effectiveDate: validEffectiveDate() });
    createdRequestIds.push(created.body.requestId);

    const fetched = await request(app).get(`/api/transfers/${created.body.requestId}`).set("x-actor-id", employeeId);
    expect(fetched.body.current).toEqual({ departmentId: ref.deptA, locationId: ref.locationA, roleId: ref.roleA });
    expect(fetched.body.proposed).toEqual({ departmentId: ref.deptB, locationId: ref.locationB, roleId: ref.roleB });
  });
});
