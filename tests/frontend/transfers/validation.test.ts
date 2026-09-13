import { describe, it, expect } from "vitest";
import { validateDraftRequest } from "../../../src/frontend/modules/transfers/utils/validation";

const lists = { departmentIds: ["deptB"], locationIds: ["locB"], roleIds: ["roleB"] };
const current = { departmentId: "deptA", locationId: "locA", roleId: "roleA" };
const validEffectiveDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

describe("validateDraftRequest (client-side mirror of AC1-AC7)", () => {
  it("accepts a fully valid draft", () => {
    const result = validateDraftRequest(
      { departmentId: "deptB", locationId: "locB", roleId: "roleB", effectiveDate: validEffectiveDate },
      lists,
      current
    );
    expect(result.valid).toBe(true);
  });

  it("AC1-3: rejects a department/location/role not in the controlled list", () => {
    const result = validateDraftRequest(
      { departmentId: "not-listed", locationId: "locB", roleId: "roleB", effectiveDate: validEffectiveDate },
      lists,
      current
    );
    expect(result.valid).toBe(false);
    expect(result.errors.departmentId).toMatch(/valid department/);
  });

  it("AC6: rejects a missing mandatory field", () => {
    const result = validateDraftRequest({ departmentId: "", locationId: "locB", roleId: "roleB", effectiveDate: validEffectiveDate }, lists, current);
    expect(result.valid).toBe(false);
    expect(result.errors.departmentId).toMatch(/required/);
  });

  it("AC4: rejects an effective date less than 4 weeks out", () => {
    const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const result = validateDraftRequest({ departmentId: "deptB", locationId: "locB", roleId: "roleB", effectiveDate: soon }, lists, current);
    expect(result.valid).toBe(false);
    expect(result.errors.effectiveDate).toMatch(/28 days/);
  });

  it("AC7: rejects a draft with no actual change from current values", () => {
    const result = validateDraftRequest(
      { departmentId: "deptA", locationId: "locA", roleId: "roleA", effectiveDate: validEffectiveDate },
      { departmentIds: ["deptA"], locationIds: ["locA"], roleIds: ["roleA"] },
      current
    );
    expect(result.valid).toBe(false);
    expect(result.errors.departmentId).toMatch(/must differ/);
  });
});
