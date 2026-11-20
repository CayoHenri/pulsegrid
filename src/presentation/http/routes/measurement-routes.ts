import { FastifyInstance } from "fastify";
import { MeasurementController } from "../controllers/measurement-controller";
import { Routes } from "./routes.interface";
import { RegisterMeasurementInput } from "../../../application/use-cases/register-measurement/register-measurement-input";
import { registerMeasurementSchema } from "../schemas/register-measurement-schema";
import { getMeasurementByIdSchema } from "../schemas/get-measurement-by-id-schema";
import { listMeasurementsByDeviceSchema } from "../schemas/list-measurements-by-device-schema";

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

    this.server.get<{ Params: { deviceId: string } }>(
      "/devices/:deviceId/measurements",
      { schema: listMeasurementsByDeviceSchema },
      async (request, reply) => {
        await this.controller.listByDevice(request, reply);
      },
    );
  }
}
