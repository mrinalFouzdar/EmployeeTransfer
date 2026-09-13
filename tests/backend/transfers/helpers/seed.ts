import type { PrismaClient } from "@prisma/client";

const monthsAgo = (n: number) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

export interface SeedRefData {
  deptA: string;
  deptB: string;
  locationA: string;
  locationB: string;
  roleA: string;
  roleB: string;
}

export async function seedRefData(prisma: PrismaClient, suffix: string): Promise<SeedRefData> {
  const [deptA, deptB, locationA, locationB, roleA, roleB] = await Promise.all([
    prisma.department.create({ data: { name: `Dept-A-${suffix}` } }),
    prisma.department.create({ data: { name: `Dept-B-${suffix}` } }),
    prisma.location.create({ data: { name: `Loc-A-${suffix}` } }),
    prisma.location.create({ data: { name: `Loc-B-${suffix}` } }),
    prisma.role.create({ data: { name: `Role-A-${suffix}` } }),
    prisma.role.create({ data: { name: `Role-B-${suffix}` } }),
  ]);
  return {
    deptA: deptA.id,
    deptB: deptB.id,
    locationA: locationA.id,
    locationB: locationB.id,
    roleA: roleA.id,
    roleB: roleB.id,
  };
}

export async function cleanupRefData(prisma: PrismaClient, ref: SeedRefData): Promise<void> {
  await prisma.department.deleteMany({ where: { id: { in: [ref.deptA, ref.deptB] } } });
  await prisma.location.deleteMany({ where: { id: { in: [ref.locationA, ref.locationB] } } });
  await prisma.role.deleteMany({ where: { id: { in: [ref.roleA, ref.roleB] } } });
}

export async function seedEstablishedEmployee(
  prisma: PrismaClient,
  employeeId: string,
  ref: SeedRefData,
  overrides: Partial<{
    managerId: string;
    probationEndDate: Date | null;
    probationExceptionApproved: boolean;
    lastTransferCompletedAt: Date | null;
    hireDate: Date;
    isActive: boolean;
    hasActiveDisciplinaryProcess: boolean;
    disciplinaryOverrideApproved: boolean;
  }> = {}
): Promise<void> {
  await prisma.employeeProfileSeed.create({
    data: {
      employeeId,
      currentDepartmentId: ref.deptA,
      currentLocationId: ref.locationA,
      currentRoleId: ref.roleA,
      managerId: overrides.managerId ?? `mgr-${employeeId}`,
      hireDate: overrides.hireDate ?? monthsAgo(24),
      probationEndDate: overrides.probationEndDate ?? null,
      probationExceptionApproved: overrides.probationExceptionApproved ?? false,
      lastTransferCompletedAt: overrides.lastTransferCompletedAt ?? null,
      isActive: overrides.isActive ?? true,
      hasActiveDisciplinaryProcess: overrides.hasActiveDisciplinaryProcess ?? false,
      disciplinaryOverrideApproved: overrides.disciplinaryOverrideApproved ?? false,
    },
  });
}

export async function cleanupEmployee(prisma: PrismaClient, employeeId: string): Promise<void> {
  await prisma.employeeProfileSeed.deleteMany({ where: { employeeId } });
}

export async function cleanupRequest(prisma: PrismaClient, requestId: string | undefined): Promise<void> {
  if (!requestId) return;
  await prisma.auditEvent.deleteMany({ where: { requestId } });
  await prisma.fulfilmentTask.deleteMany({ where: { requestId } });
  await prisma.hrDecision.deleteMany({ where: { requestId } });
  await prisma.managerDecision.deleteMany({ where: { requestId } });
  await prisma.transferRequest.deleteMany({ where: { id: requestId } });
}

export const validEffectiveDate = (): string => daysFromNow(90).toISOString();
export { daysFromNow, monthsAgo };
