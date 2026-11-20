import { FastifyInstance } from "fastify";
import type { Routes } from "./routes.interface.js";
import { rootResponseSchema } from "../schemas/root-response-schema.js";

export class RootRoutes implements Routes {
  constructor(private readonly server: FastifyInstance) {}

  register(): void {
    this.server.get(
      "/",
      {
        schema: {
          tags: ["Health"],
          summary: "Informações básicas da API",
          response: { 200: rootResponseSchema },
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
