import { FastifyInstance } from "fastify";
import { MeasurementController } from "../controllers/measurement-controller";
import { Routes } from "./routes.interface";
import { RegisterMeasurementInput } from "../../../application/use-cases/register-measurement/register-measurement-input";
import { registerMeasurementSchema } from "../schemas/register-measurement-schema";

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

    this.server.get<{ Params: { id: string } }>("/measurements/:id", async (request, reply) => {
      await this.controller.getById(request, reply);
    });

    this.server.get<{ Params: { deviceId: string } }>("/devices/:deviceId/measurements", async (request, reply) => {
      await this.controller.listByDevice(request, reply);
    });
  }
}
