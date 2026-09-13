import type { PrismaClient } from "@prisma/client";
import type { FulfilmentTaskGateway, FulfilmentTaskTypeName } from "./FulfilmentTaskGateway";

/**
 * Interim adapter (approved Plan "Explicitly Deferred"): "raising" a task means creating an
 * IN_PROGRESS FulfilmentTask row for HR/Ops to action and report status on manually via
 * API07, since BRD.md Q20 hasn't confirmed whether Payroll/ITSM/Facilities can push status
 * automatically. Swapping in a real push-based gateway later needs no change elsewhere.
 */
export class ManualFulfilmentAdapter implements FulfilmentTaskGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async raiseTask(requestId: string, taskType: FulfilmentTaskTypeName): Promise<void> {
    await this.prisma.fulfilmentTask.upsert({
      where: { requestId_taskType: { requestId, taskType } },
      create: { requestId, taskType, status: "IN_PROGRESS" },
      update: { status: "IN_PROGRESS" },
    });
  }
}
