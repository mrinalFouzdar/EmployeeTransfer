import type { NextFunction, Request, Response } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actorId?: string;
      actorRole?: string;
    }
  }
}

/**
 * PLACEHOLDER identity mechanism pending real authentication (constitution.md § Security
 * Posture: JWT token specifics are `[Open]` - no auth Spec has been approved yet). Reads
 * `x-actor-id` / `x-actor-role` headers so the rest of the module can be built and tested
 * against a stable identity contract now, and swapped for real JWT-derived identity later
 * without changing controller/service code.
 */
export function requireActor(req: Request, res: Response, next: NextFunction): void {
  const actorId = req.header("x-actor-id");
  if (!actorId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "x-actor-id header is required (placeholder auth)" });
    return;
  }
  req.actorId = actorId;
  req.actorRole = req.header("x-actor-role") ?? undefined;
  next();
}

/** HR-only guard, same placeholder caveat as requireActor. */
export function requireHrRole(req: Request, res: Response, next: NextFunction): void {
  if (req.actorRole !== "HR") {
    res.status(403).json({ error: "FORBIDDEN", message: "x-actor-role: HR is required for this action" });
    return;
  }
  next();
}
