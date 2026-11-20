import { FastifyReply } from "fastify";
import { RegisterMeasurementInput } from "../../../application/use-cases/register-measurement/register-measurement-input.js";
import { RegisterMeasurementUseCase } from "../../../application/use-cases/register-measurement/register-measurement-use-case.js";
import type { FastifyRequest } from "fastify";
import { GetMeasurementByIdUseCase } from "../../../application/use-cases/get-measurement-by-id/get-measurement-by-id-use-case.js";
import { ListMeasurementsByDeviceUseCase } from "../../../application/use-cases/list-measurements-by-device/list-measurements-by-device-use-case.js";

export class MeasurementController {
  constructor(
    private readonly registerMeasurementUseCase: RegisterMeasurementUseCase,
    private readonly getMeasurementByIdUseCase: GetMeasurementByIdUseCase,
    private readonly listMeasurementsByDeviceUseCase: ListMeasurementsByDeviceUseCase,
  ) {}

  public async create(input: RegisterMeasurementInput, reply: FastifyReply) {
    const result = await this.registerMeasurementUseCase.execute(input);
    await reply.status(201).send({
      id: result.id,
      deviceId: result.deviceId,
      value: result.value,
      recordedAt: result.recordedAt,
      createdAt: result.createdAt,
    });
  }

  public async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.getMeasurementByIdUseCase.execute({ id: request.params.id });
    await reply.status(200).send(result);
  }

  public async listByDevice(
    request: FastifyRequest<{
      Params: { deviceId: string };
      Querystring: {
        limit?: number;
        from?: string;
        to?: string;
        cursor?: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.listMeasurementsByDeviceUseCase.execute({
      deviceId: request.params.deviceId,
      ...request.query,
    });
    await reply.status(200).send(result);
  }
}
