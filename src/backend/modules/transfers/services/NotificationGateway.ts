export interface NotificationGateway {
  notifyEmployee(employeeId: string, event: string, detail?: Record<string, unknown>): Promise<void>;
  notifyStakeholder(stakeholder: string, event: string, detail?: Record<string, unknown>): Promise<void>;
}

/**
 * BR-35/BR-36 require that notifications fire, not a specific channel. Real channel
 * wiring (email/in-app) is deferred (BRD.md A-T05) - this stub logs so the trigger points
 * are exercised and testable now.
 */
export class ConsoleNotificationGateway implements NotificationGateway {
  async notifyEmployee(employeeId: string, event: string, detail: Record<string, unknown> = {}): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[notify:employee:${employeeId}] ${event}`, detail);
  }

  async notifyStakeholder(stakeholder: string, event: string, detail: Record<string, unknown> = {}): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[notify:stakeholder:${stakeholder}] ${event}`, detail);
  }
}
