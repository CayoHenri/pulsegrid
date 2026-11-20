import { FastifyInstance } from "fastify";
import type { Routes } from "./routes.interface.js";
import { HealthController } from "../controllers/health-controller.js";
import { healthResponseSchemas } from "../schemas/health-response-schemas.js";

export class HealthRoutes implements Routes {
  constructor(
    private readonly server: FastifyInstance,
    private readonly controller: HealthController,
  ) {}

  public register(): void {
    this.server.get(
      "/health",
      { schema: { tags: ["Health"], summary: "Verifica se a API responde", response: { 200: healthResponseSchemas.healthy } } },
      async (request, reply) => {
        await this.controller.health(request, reply);
      },
    );

    this.server.get(
      "/live",
      {
        schema: {
          tags: ["Health"],
          summary: "Verifica se o processo está ativo",
          response: { 200: healthResponseSchemas.alive },
        },
      },
      async (request, reply) => {
        await this.controller.live(request, reply);
      },
    );

    this.server.get(
      "/ready",
      {
        schema: {
          tags: ["Health"],
          summary: "Verifica se a API está pronta para receber tráfego",
          response: { 200: healthResponseSchemas.ready, 503: healthResponseSchemas.notReady },
        },
      },
      async (request, reply) => {
        await this.controller.ready(request, reply);
      },
    );
  }
}
