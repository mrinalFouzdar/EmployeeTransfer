export interface EmployeeProfile {
  employeeId: string;
  name: string | null;
  currentDepartmentId: string;
  currentLocationId: string;
  currentRoleId: string;
  managerId: string;
  tenureMonths: number;
  isOnProbation: boolean;
  hasProbationException: boolean;
  monthsSinceLastCompletedTransfer: number | null;
  isActive: boolean;
  hasActiveDisciplinaryProcess: boolean;
  hasDisciplinaryOverride: boolean;
}

export interface EmployeeProfileProvider {
  getProfile(employeeId: string): Promise<EmployeeProfile | null>;
}

/** What the request form needs to pre-populate current values (AC12) - a narrower, public-safe view. */
export interface EmployeeProfileSummary {
  employeeId: string;
  name: string | null;
  currentDepartmentId: string;
  currentLocationId: string;
  currentRoleId: string;
}

export function toProfileSummary(profile: EmployeeProfile): EmployeeProfileSummary {
  return {
    employeeId: profile.employeeId,
    name: profile.name,
    currentDepartmentId: profile.currentDepartmentId,
    currentLocationId: profile.currentLocationId,
    currentRoleId: profile.currentRoleId,
  };
}
