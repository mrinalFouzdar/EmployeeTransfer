import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { createReferenceDataController } from "../controllers/referenceDataController";
import { requireActor } from "../../../app/middleware/actor";

export function buildReferenceDataRouter(prisma: PrismaClient): Router {
  const router = Router();
  const controller = createReferenceDataController(prisma);

  router.use(requireActor);
  router.get("/departments", controller.listDepartments);
  router.get("/locations", controller.listLocations);
  router.get("/roles", controller.listRoles);

  return router;
}
