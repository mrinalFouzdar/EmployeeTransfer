import "dotenv/config";
import request from "supertest";
import { prisma } from "../../../src/backend/shared/database/prismaClient";
import { createApp } from "../../../src/backend/app/server";
import { seedRefData, cleanupRefData, SeedRefData } from "./helpers/seed";

const app = createApp();

describe("GET /api/reference-data/*", () => {
  let ref: SeedRefData;

  beforeAll(async () => {
    ref = await seedRefData(prisma, "refData");
  });

  afterAll(async () => {
    await cleanupRefData(prisma, ref);
    await prisma.$disconnect();
  });

  it("lists departments for populating the request form's controlled list", async () => {
    const res = await request(app).get("/api/reference-data/departments").set("x-actor-id", "someone");
    expect(res.status).toBe(200);
    expect(res.body.items.some((d: { id: string }) => d.id === ref.deptA)).toBe(true);
  });

  it("lists locations and roles", async () => {
    const [locations, roles] = await Promise.all([
      request(app).get("/api/reference-data/locations").set("x-actor-id", "someone"),
      request(app).get("/api/reference-data/roles").set("x-actor-id", "someone"),
    ]);
    expect(locations.body.items.some((l: { id: string }) => l.id === ref.locationA)).toBe(true);
    expect(roles.body.items.some((r: { id: string }) => r.id === ref.roleA)).toBe(true);
  });

  it("requires an actor identity", async () => {
    const res = await request(app).get("/api/reference-data/departments");
    expect(res.status).toBe(401);
  });
});
