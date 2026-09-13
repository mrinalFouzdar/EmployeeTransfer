import type { Request, Response } from "express";
import { TransferService } from "../services/TransferService";
import { EmployeeProfileProvider, toProfileSummary } from "../services/EmployeeProfileProvider";
import { ApiError } from "../../../shared/errors/ApiError";
import {
  createTransferRequestSchema,
  managerDecisionSchema,
  hrDecisionSchema,
  fulfilmentTaskStatusSchema,
  firstZodFieldError,
} from "../validators/transferValidators";
function paramStr(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toBody());
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "INTERNAL_ERROR" });
}

export class TransfersController {
  constructor(
    private readonly service: TransferService,
    private readonly profileProvider: EmployeeProfileProvider
  ) {}

  /** Backs AC12 (pre-population) - lets the request form show the caller's current values. */
  myProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.profileProvider.getProfile(req.actorId!);
      if (!profile) {
        res.status(404).json({ error: "NOT_FOUND" });
        return;
      }
      res.status(200).json(toProfileSummary(profile));
    } catch (err) {
      handleError(res, err);
    }
  };

  /** "Approvals" tab - requests waiting on the caller as a manager. */
  pendingManagerDecisions = async (req: Request, res: Response): Promise<void> => {
    try {
      const items = await this.service.listPendingManagerDecisions(req.actorId!);
      res.status(200).json({ items });
    } catch (err) {
      handleError(res, err);
    }
  };

  /** "HR Review" tab - all requests currently awaiting an HR decision. */
  pendingHrReview = async (_req: Request, res: Response): Promise<void> => {
    try {
      const items = await this.service.listPendingHrReview();
      res.status(200).json({ items });
    } catch (err) {
      handleError(res, err);
    }
  };

  createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = createTransferRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", field: firstZodFieldError(parsed.error) });
        return;
      }
      const result = await this.service.createRequest(req.actorId!, parsed.data);
      res.status(201).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };

  getRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getRequest(paramStr(req.params.id), req.actorId!);
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };

  listRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await this.service.listRequests(req.actorId!);
      res.status(200).json({ requests });
    } catch (err) {
      handleError(res, err);
    }
  };

  withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.withdraw(paramStr(req.params.id), req.actorId!);
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };

  amend = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = createTransferRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", field: firstZodFieldError(parsed.error) });
        return;
      }
      const result = await this.service.amend(paramStr(req.params.id), req.actorId!, parsed.data);
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };

  managerDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = managerDecisionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", field: firstZodFieldError(parsed.error) });
        return;
      }
      const result = await this.service.recordManagerDecision(paramStr(req.params.id), req.actorId!, parsed.data);
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };

  hrDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = hrDecisionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", field: firstZodFieldError(parsed.error) });
        return;
      }
      const result = await this.service.recordHrDecision(paramStr(req.params.id), req.actorId!, parsed.data);
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };

  fulfilmentTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = fulfilmentTaskStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", field: firstZodFieldError(parsed.error) });
        return;
      }
      const result = await this.service.updateFulfilmentTaskStatus(
        paramStr(req.params.id),
        paramStr(req.params.taskType),
        parsed.data
      );
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  };
}
