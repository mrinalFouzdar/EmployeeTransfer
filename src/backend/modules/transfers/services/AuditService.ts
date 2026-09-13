import type { PrismaClient } from "@prisma/client";

/** BR-33: every state transition is recorded with actor, timestamp, decision, reason. */
export class AuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async record(params: {
    requestId: string;
    actor: string;
    action: string;
    decision?: string;
    reason?: string;
  }): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        requestId: params.requestId,
        actor: params.actor,
        action: params.action,
        decision: params.decision ?? null,
        reason: params.reason ?? null,
      },
    });
  }
}
