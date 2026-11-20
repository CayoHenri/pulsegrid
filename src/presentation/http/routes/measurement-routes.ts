import { FastifyInstance } from "fastify";
import { MeasurementController } from "../controllers/measurement-controller.js";
import type { Routes } from "./routes.interface.js";
import { RegisterMeasurementInput } from "../../../application/use-cases/register-measurement/register-measurement-input.js";
import { registerMeasurementSchema } from "../schemas/register-measurement-schema.js";
import { getMeasurementByIdSchema } from "../schemas/get-measurement-by-id-schema.js";
import { listMeasurementsByDeviceSchema } from "../schemas/list-measurements-by-device-schema.js";

export class MeasurementRoutes implements Routes {
  constructor(
    private readonly server: FastifyInstance,
    private readonly controller: MeasurementController,
  ) {}

  register(): void {
    this.server.post<{ Body: RegisterMeasurementInput }>(
      "/measurements",
      {
        schema: registerMeasurementSchema,
      },
      async (request, reply) => {
        await this.controller.create(request.body, reply);
      },
    );

    this.server.get<{ Params: { id: string } }>(
      "/measurements/:id",
      { schema: getMeasurementByIdSchema },
      async (request, reply) => {
        await this.controller.getById(request, reply);
      },
    );

    this.server.get<{
      Params: { deviceId: string };
      Querystring: {
        limit?: number;
        from?: string;
        to?: string;
        cursor?: string;
      };
    }>(
      "/devices/:deviceId/measurements",
      { schema: listMeasurementsByDeviceSchema },
      async (request, reply) => {
        await this.controller.listByDevice(request, reply);
      },
    );
  }
}
