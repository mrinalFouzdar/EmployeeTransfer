import "dotenv/config";
import { prisma } from "../../../src/backend/shared/database/prismaClient";

describe("T01 - Prisma schema & migration (infrastructure prerequisite)", () => {
  let departmentId: string;
  let locationId: string;
  let roleId: string;
  let createdRequestId: string;

  beforeAll(async () => {
    // Suffixed to avoid colliding with real demo/seed data using plain names like
    // "Engineering"/"London" (this test file predates that convention - T02+ tests use it).
    const department = await prisma.department.create({ data: { name: "Engineering-T01-test" } });
    const location = await prisma.location.create({ data: { name: "London-T01-test" } });
    const role = await prisma.role.create({ data: { name: "Software Engineer-T01-test" } });
    departmentId = department.id;
    locationId = location.id;
    roleId = role.id;
  });

  afterAll(async () => {
    if (createdRequestId) {
      await prisma.auditEvent.deleteMany({ where: { requestId: createdRequestId } });
      await prisma.fulfilmentTask.deleteMany({ where: { requestId: createdRequestId } });
      await prisma.transferRequest.delete({ where: { id: createdRequestId } });
    }
    await prisma.department.deleteMany({ where: { id: departmentId } });
    await prisma.location.deleteMany({ where: { id: locationId } });
    await prisma.role.deleteMany({ where: { id: roleId } });
    await prisma.$disconnect();
  });

  it("creates a TransferRequest defaulting to DRAFT status and reads it back", async () => {
    const created = await prisma.transferRequest.create({
      data: {
        employeeId: "emp-test-001",
        currentDepartmentId: departmentId,
        currentLocationId: locationId,
        currentRoleId: roleId,
        proposedDepartmentId: departmentId,
        proposedLocationId: locationId,
        proposedRoleId: roleId,
        effectiveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    createdRequestId = created.id;

    expect(created.status).toBe("DRAFT");

    const fetched = await prisma.transferRequest.findUnique({ where: { id: created.id } });
    expect(fetched).not.toBeNull();
    expect(fetched?.employeeId).toBe("emp-test-001");
  });

  it("supports a FulfilmentTask linked to a TransferRequest with a unique (requestId, taskType)", async () => {
    const task = await prisma.fulfilmentTask.create({
      data: { requestId: createdRequestId, taskType: "FACILITIES" },
    });
    expect(task.status).toBe("NOT_APPLICABLE");
  });

  it("supports an AuditEvent linked to a TransferRequest", async () => {
    const event = await prisma.auditEvent.create({
      data: { requestId: createdRequestId, actor: "system-test", action: "created" },
    });
    expect(event.requestId).toBe(createdRequestId);
  });
});
