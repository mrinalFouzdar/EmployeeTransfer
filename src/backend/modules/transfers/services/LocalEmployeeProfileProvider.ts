import type { PrismaClient } from "@prisma/client";
import type { EmployeeProfile, EmployeeProfileProvider } from "./EmployeeProfileProvider";

function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    months -= 1;
  }
  return Math.max(months, 0);
}

/**
 * Local/seeded stand-in for the real HR/Core HCM integration (BRD.md Q19).
 * Explicitly deferred per .ai-context/plans/internal-transfer-request.plan.md
 * "Explicitly Deferred" — do not treat EmployeeProfileSeed as a real employees/org module.
 */
export class LocalEmployeeProfileProvider implements EmployeeProfileProvider {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfile(employeeId: string): Promise<EmployeeProfile | null> {
    const seed = await this.prisma.employeeProfileSeed.findUnique({
      where: { employeeId },
    });

    if (!seed) {
      return null;
    }

    const now = new Date();
    const isOnProbation = seed.probationEndDate !== null && seed.probationEndDate > now;
    const monthsSinceLastCompletedTransfer =
      seed.lastTransferCompletedAt !== null
        ? monthsBetween(seed.lastTransferCompletedAt, now)
        : null;

    return {
      employeeId: seed.employeeId,
      name: seed.name,
      currentDepartmentId: seed.currentDepartmentId,
      currentLocationId: seed.currentLocationId,
      currentRoleId: seed.currentRoleId,
      managerId: seed.managerId,
      tenureMonths: monthsBetween(seed.hireDate, now),
      isOnProbation,
      hasProbationException: seed.probationExceptionApproved,
      monthsSinceLastCompletedTransfer,
      isActive: seed.isActive,
      hasActiveDisciplinaryProcess: seed.hasActiveDisciplinaryProcess,
      hasDisciplinaryOverride: seed.disciplinaryOverrideApproved,
    };
  }
}
