import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";

/**
 * BR-08 requires department/location/role to be selected from controlled lists - the
 * frontend needs a way to know what those lists are. Not in the original API Contract
 * (API01-API07 assume the caller already has valid IDs); added as a small, obviously-needed
 * extension rather than leaving the frontend with no way to populate its selects.
 */
export function createReferenceDataController(prisma: PrismaClient) {
  return {
    listDepartments: async (_req: Request, res: Response) => {
      const items = await prisma.department.findMany({ orderBy: { name: "asc" } });
      res.status(200).json({ items });
    },
    listLocations: async (_req: Request, res: Response) => {
      const items = await prisma.location.findMany({ orderBy: { name: "asc" } });
      res.status(200).json({ items });
    },
    listRoles: async (_req: Request, res: Response) => {
      const items = await prisma.role.findMany({ orderBy: { name: "asc" } });
      res.status(200).json({ items });
    },
  };
}
