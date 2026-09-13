export type FulfilmentTaskTypeName = "PAYROLL" | "IT" | "FACILITIES";
export type FulfilmentTaskStatusName = "NOT_APPLICABLE" | "IN_PROGRESS" | "COMPLETE" | "FAILED";

/**
 * Interface boundary for Payroll/IT/Facilities orchestration (KD-T03, KD-T04). BRD.md Q20
 * is unresolved (can these systems push status automatically?) - this interface lets a real
 * push-based adapter replace ManualFulfilmentAdapter later with no change to the
 * transfers module's own code.
 */
export interface FulfilmentTaskGateway {
  raiseTask(requestId: string, taskType: FulfilmentTaskTypeName): Promise<void>;
}
