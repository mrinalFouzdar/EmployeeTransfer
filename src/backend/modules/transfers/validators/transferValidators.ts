import { z } from "zod";

export const createTransferRequestSchema = z.object({
  departmentId: z.string().min(1, "departmentId is required"),
  locationId: z.string().min(1, "locationId is required"),
  roleId: z.string().min(1, "roleId is required"),
  effectiveDate: z.string().min(1, "effectiveDate is required"),
  reason: z.string().nullable().optional(),
  // Not in the original Gate-1-approved API01 payload - added during implementation because
  // no data source names "the manager of target department X" (BRD.md has no such lookup).
  // Optional; when present, BR-16 receiving-manager confirmation is required.
  receivingManagerId: z.string().nullable().optional(),
});
export type CreateTransferRequestInput = z.infer<typeof createTransferRequestSchema>;

export const managerDecisionSchema = z.object({
  managerRole: z.enum(["current", "receiving"]),
  decision: z.enum(["confirm", "decline", "return"]),
  reason: z.string().nullable().optional(),
});
export type ManagerDecisionInput = z.infer<typeof managerDecisionSchema>;

export const hrDecisionSchema = z.object({
  decision: z.enum(["eligible", "not_eligible", "eligible_with_conditions"]),
  reason: z.string().nullable().optional(),
  conditions: z.string().nullable().optional(),
});
export type HrDecisionInput = z.infer<typeof hrDecisionSchema>;

export const fulfilmentTaskStatusSchema = z.object({
  status: z.enum(["not_applicable", "in_progress", "complete", "failed"]),
  note: z.string().nullable().optional(),
});
export type FulfilmentTaskStatusInput = z.infer<typeof fulfilmentTaskStatusSchema>;

/** Which field of createTransferRequestSchema failed, for VALIDATION_ERROR.field. */
export function firstZodFieldError(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? String(issue.path[0] ?? "unknown") : "unknown";
}
