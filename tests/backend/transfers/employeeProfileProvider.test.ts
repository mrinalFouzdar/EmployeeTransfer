import "dotenv/config";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { LocalEmployeeProfileProvider } from "../../../src/backend/modules/transfers/services/LocalEmployeeProfileProvider";

describe("T02 - EmployeeProfileProvider (local/seeded adapter)", () => {
  const provider = new LocalEmployeeProfileProvider(prisma);

  let departmentId: string;
  let locationId: string;
  let roleId: string;

  const employeeIdEstablished = "emp-established-001";
  const employeeIdNewHire = "emp-new-hire-001";
  const employeeIdOnProbation = "emp-probation-001";
  const employeeIdProbationException = "emp-probation-exception-001";
  const employeeIdRecentTransfer = "emp-recent-transfer-001";

  beforeAll(async () => {
    const department = await prisma.department.create({ data: { name: "T02 Engineering" } });
    const location = await prisma.location.create({ data: { name: "T02 London" } });
    const role = await prisma.role.create({ data: { name: "T02 Software Engineer" } });
    departmentId = department.id;
    locationId = location.id;
    roleId = role.id;

    const monthsAgo = (n: number) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);

    await prisma.employeeProfileSeed.createMany({
      data: [
        {
          employeeId: employeeIdEstablished,
          currentDepartmentId: departmentId,
          currentLocationId: locationId,
          currentRoleId: roleId,
          managerId: "mgr-001",
          hireDate: monthsAgo(24),
        },
        {
          employeeId: employeeIdNewHire,
          currentDepartmentId: departmentId,
          currentLocationId: locationId,
          currentRoleId: roleId,
          managerId: "mgr-001",
          hireDate: monthsAgo(3),
        },
        {
          employeeId: employeeIdOnProbation,
          currentDepartmentId: departmentId,
          currentLocationId: locationId,
          currentRoleId: roleId,
          managerId: "mgr-001",
          hireDate: monthsAgo(2),
          probationEndDate: monthsAgo(-1), // 1 month in the future
          probationExceptionApproved: false,
        },
        {
          employeeId: employeeIdProbationException,
          currentDepartmentId: departmentId,
          currentLocationId: locationId,
          currentRoleId: roleId,
          managerId: "mgr-001",
          hireDate: monthsAgo(2),
          probationEndDate: monthsAgo(-1),
          probationExceptionApproved: true,
        },
        {
          employeeId: employeeIdRecentTransfer,
          currentDepartmentId: departmentId,
          currentLocationId: locationId,
          currentRoleId: roleId,
          managerId: "mgr-001",
          hireDate: monthsAgo(36),
          lastTransferCompletedAt: monthsAgo(4),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.employeeProfileSeed.deleteMany({
      where: {
        employeeId: {
          in: [
            employeeIdEstablished,
            employeeIdNewHire,
            employeeIdOnProbation,
            employeeIdProbationException,
            employeeIdRecentTransfer,
          ],
        },
      },
    });
    await prisma.department.deleteMany({ where: { id: departmentId } });
    await prisma.location.deleteMany({ where: { id: locationId } });
    await prisma.role.deleteMany({ where: { id: roleId } });
    await prisma.$disconnect();
  });

  it("returns null for an unknown employee", async () => {
    const profile = await provider.getProfile("no-such-employee");
    expect(profile).toBeNull();
  });

  it("returns current department/location/role/manager for pre-population (AC12)", async () => {
    const profile = await provider.getProfile(employeeIdEstablished);
    expect(profile).not.toBeNull();
    expect(profile?.currentDepartmentId).toBe(departmentId);
    expect(profile?.currentLocationId).toBe(locationId);
    expect(profile?.currentRoleId).toBe(roleId);
    expect(profile?.managerId).toBe("mgr-001");
  });

  it("computes tenureMonths from hireDate (>= 12 months for an established employee)", async () => {
    const profile = await provider.getProfile(employeeIdEstablished);
    expect(profile?.tenureMonths).toBeGreaterThanOrEqual(12);
  });

  it("computes tenureMonths < 12 for a new hire (feeds BR-02 eligibility in T06)", async () => {
    const profile = await provider.getProfile(employeeIdNewHire);
    expect(profile?.tenureMonths).toBeLessThan(12);
  });

  it("flags isOnProbation true when probationEndDate is in the future", async () => {
    const profile = await provider.getProfile(employeeIdOnProbation);
    expect(profile?.isOnProbation).toBe(true);
    expect(profile?.hasProbationException).toBe(false);
  });

  it("carries the recorded HR probation exception (BR-03)", async () => {
    const profile = await provider.getProfile(employeeIdProbationException);
    expect(profile?.isOnProbation).toBe(true);
    expect(profile?.hasProbationException).toBe(true);
  });

  it("reports isOnProbation false and no probation history for a long-tenured employee", async () => {
    const profile = await provider.getProfile(employeeIdEstablished);
    expect(profile?.isOnProbation).toBe(false);
  });

  it("computes monthsSinceLastCompletedTransfer for the cooling-off rule (BR-05)", async () => {
    const profile = await provider.getProfile(employeeIdRecentTransfer);
    expect(profile?.monthsSinceLastCompletedTransfer).not.toBeNull();
    expect(profile?.monthsSinceLastCompletedTransfer as number).toBeLessThan(12);
  });

  it("returns null monthsSinceLastCompletedTransfer when the employee has never transferred", async () => {
    const profile = await provider.getProfile(employeeIdEstablished);
    expect(profile?.monthsSinceLastCompletedTransfer).toBeNull();
  });
});
