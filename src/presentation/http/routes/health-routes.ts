import { FastifyInstance } from "fastify";
import { Routes } from "./routes.interface";
import { HealthController } from "../controllers/health-controller";

export class HealthRoutes implements Routes {
  constructor(
    private readonly server: FastifyInstance,
    private readonly controller: HealthController,
  ) {}

  public register(): void {
    this.server.get("/health", async (request, reply) => {
      await this.controller.health(request, reply);
    });

    this.server.get("/live", async (request, reply) => {
      await this.controller.live(request, reply);
    });

    this.server.get("/ready", async (request, reply) => {
      await this.controller.ready(request, reply);
    });
  }
}
