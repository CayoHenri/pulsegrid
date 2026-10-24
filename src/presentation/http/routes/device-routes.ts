import type { FastifyInstance } from "fastify";
import type { Routes } from "./routes.interface";
import type { DeviceController } from "../controllers/device-controller";
import type { RegisterDeviceInput } from "../../../application/use-cases/register-device/register-device-input";
import { registerDeviceSchema } from "../schemas/register-device-schema";

export class DeviceRoutes implements Routes {
  constructor(
    private readonly server: FastifyInstance,
    private readonly controller: DeviceController,
  ) {}

  public register(): void {
    this.server.post<{ Body: RegisterDeviceInput }>(
      "/devices",
      {
        schema: registerDeviceSchema,
      },
      async (request, reply) => {
        await this.controller.create(request.body, reply);
      },
    );

    this.server.get("/devices", async (_request, reply) => {
      await this.controller.list(reply);
    });

    this.server.get<{ Params: { id: string } }>(
      "/devices/:id",
      async (request, reply) => {
        await this.controller.getById(request, reply);
      },
    );
  }
}
