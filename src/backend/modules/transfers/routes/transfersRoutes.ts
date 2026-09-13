import { Router } from "express";
import { TransfersController } from "../controllers/transfersController";
import { requireActor, requireHrRole } from "../../../app/middleware/actor";

export function buildTransfersRouter(controller: TransfersController): Router {
  const router = Router();

  router.use(requireActor);

  router.post("/", controller.createRequest);
  router.get("/", controller.listRequests);
  router.get("/my-profile", controller.myProfile);
  router.get("/queues/manager-approvals", controller.pendingManagerDecisions);
  router.get("/queues/hr-review", requireHrRole, controller.pendingHrReview);
  router.get("/:id", controller.getRequest);
  router.post("/:id/withdraw", controller.withdraw);
  router.post("/:id/amend", controller.amend);
  router.post("/:id/manager-decision", controller.managerDecision);
  router.post("/:id/hr-decision", requireHrRole, controller.hrDecision);
  router.post("/:id/fulfilment-tasks/:taskType/status", controller.fulfilmentTaskStatus);

  return router;
}
