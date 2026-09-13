/** Client-side mirror of the server's capture validation (BR-07, BR-08, BR-10) - the
 * server remains the source of truth; this only gives faster feedback in the form. */
export interface DraftRequest {
  departmentId: string;
  locationId: string;
  roleId: string;
  effectiveDate: string;
  reason?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof DraftRequest, string>>;
}

const MIN_LEAD_DAYS = 28;

export function validateDraftRequest(
  draft: DraftRequest,
  controlledLists: { departmentIds: string[]; locationIds: string[]; roleIds: string[] },
  current: { departmentId: string; locationId: string; roleId: string }
): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  if (!draft.departmentId) errors.departmentId = "Department is required";
  else if (!controlledLists.departmentIds.includes(draft.departmentId)) errors.departmentId = "Select a valid department";

  if (!draft.locationId) errors.locationId = "Location is required";
  else if (!controlledLists.locationIds.includes(draft.locationId)) errors.locationId = "Select a valid location";

  if (!draft.roleId) errors.roleId = "Role is required";
  else if (!controlledLists.roleIds.includes(draft.roleId)) errors.roleId = "Select a valid role";

  if (!draft.effectiveDate) {
    errors.effectiveDate = "Effective date is required";
  } else {
    const chosen = new Date(draft.effectiveDate);
    const minDate = new Date(Date.now() + MIN_LEAD_DAYS * 24 * 60 * 60 * 1000);
    if (Number.isNaN(chosen.getTime()) || chosen < minDate) {
      errors.effectiveDate = `Effective date must be at least ${MIN_LEAD_DAYS} days from today`;
    }
  }

  if (
    !errors.departmentId &&
    !errors.locationId &&
    !errors.roleId &&
    draft.departmentId === current.departmentId &&
    draft.locationId === current.locationId &&
    draft.roleId === current.roleId
  ) {
    errors.departmentId = "Proposed values must differ from your current department, location, or role";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
