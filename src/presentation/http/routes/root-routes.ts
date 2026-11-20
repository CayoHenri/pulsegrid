import { FastifyInstance } from "fastify";
import type { Routes } from "./routes.interface.js";

export class RootRoutes implements Routes {
  constructor(private readonly server: FastifyInstance) {}

  register(): void {
    this.server.get(
      "/",
      {
        schema: {
          tags: ["Health"],
          summary: "Informações básicas da API",
          response: {
            200: {
              type: "object",
              properties: {
                name: { type: "string" },
                status: { type: "string" },
              },
            },
          },
        },
      },
      async () => {
        return {
          name: "PulseGrid API",
          status: "running",
        };
      },
    );
  }
}
