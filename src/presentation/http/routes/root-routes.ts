import { FastifyInstance } from "fastify";
import { Routes } from "./routes.interface";

export class RootRoutes implements Routes {
  constructor(private readonly server: FastifyInstance) {}
  
  register(): void {
    this.server.get("/", async () => {
      return {
        name: "PulseGrid API",
        status: "running",
      };
    });
  }
}
