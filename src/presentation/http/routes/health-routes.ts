import { FastifyInstance } from "fastify";
import { Routes } from "./routes.interface";

export class HealthRoutes implements Routes {
  constructor(private readonly server: FastifyInstance) {}

  public register(): void {
    this.server.get("/health", async () => {
      return {
        status: "ok",
      };
    });
  }
}
