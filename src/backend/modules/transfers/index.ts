import type { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { TransferRepository } from "./repositories/TransferRepository";
import { LocalEmployeeProfileProvider } from "./services/LocalEmployeeProfileProvider";
import { ManualFulfilmentAdapter } from "./services/ManualFulfilmentAdapter";
import { ConsoleNotificationGateway } from "./services/NotificationGateway";
import { AuditService } from "./services/AuditService";
import { TransferService } from "./services/TransferService";
import { TransfersController } from "./controllers/transfersController";
import { buildTransfersRouter } from "./routes/transfersRoutes";
import { buildReferenceDataRouter } from "./routes/referenceDataRoutes";

/** Composition root for the `transfers` module - wires the approved architecture's layers. */
export function createTransfersModule(prisma: PrismaClient): { router: Router; referenceDataRouter: Router; service: TransferService } {
  const repo = new TransferRepository(prisma);
  const profileProvider = new LocalEmployeeProfileProvider(prisma);
  const gateway = new ManualFulfilmentAdapter(prisma);
  const notifier = new ConsoleNotificationGateway();
  const audit = new AuditService(prisma);

  const service = new TransferService(repo, profileProvider, gateway, notifier, audit);
  const controller = new TransfersController(service, profileProvider);
  const router = buildTransfersRouter(controller);
  const referenceDataRouter = buildReferenceDataRouter(prisma);

  return { router, referenceDataRouter, service };
}
