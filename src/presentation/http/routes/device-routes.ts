import type { FastifyInstance } from "fastify";
import type { Routes } from "./routes.interface.js";
import type { DeviceController } from "../controllers/device-controller.js";
import type { RegisterDeviceInput } from "../../../application/use-cases/register-device/register-device-input.js";
import { registerDeviceSchema } from "../schemas/register-device-schema.js";
import { listDevicesSchema } from "../schemas/list-devices-schema.js";
import { getDeviceByIdSchema } from "../schemas/get-device-by-id-schema.js";

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

    this.server.get("/devices", { schema: listDevicesSchema }, async (_request, reply) => {
      await this.controller.list(reply);
    });

    this.server.get<{ Params: { id: string } }>(
      "/devices/:id",
      { schema: getDeviceByIdSchema },
      async (request, reply) => {
        await this.controller.getById(request, reply);
      },
    );
  }
}
