import type { RegisterDeviceUseCase } from "../../../application/use-cases/register-device/register-device-use-case";
import type { RegisterDeviceInput } from "../../../application/use-cases/register-device/register-device-input";
import { ListDevicesUseCase } from "../../../application/use-cases/list-devices/list-devices-use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import { GetDeviceByIdUseCase } from "../../../application/use-cases/get-device-by-id/get-device-by-id-use-case";

export class DeviceController {
  constructor(
    private readonly registerDeviceUseCase: RegisterDeviceUseCase,
    private readonly listDevicesUseCase: ListDevicesUseCase,
    private readonly getDeviceByIdUseCase: GetDeviceByIdUseCase,
  ) {}

  public async create(
    input: RegisterDeviceInput,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.registerDeviceUseCase.execute(input);
    await reply.status(201).send(result);
  }

  public async list(reply: FastifyReply): Promise<void> {
    const result = await this.listDevicesUseCase.execute();
    await reply.status(200).send(result);
  }

  public async getById(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.getDeviceByIdUseCase.execute({
      id: request.params.id,
    });
    await reply.status(200).send(result);
  }
}
