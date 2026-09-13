import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { prisma } from "../shared/database/prismaClient";
import { createTransfersModule } from "../modules/transfers";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const { router: transfersRouter, referenceDataRouter } = createTransfersModule(prisma);
  app.use("/api/transfers", transfersRouter);
  app.use("/api/reference-data", referenceDataRouter);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Employee Portal backend listening on port ${port}`);
  });
}
