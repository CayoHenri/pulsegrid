import { DeviceRepository } from "../../../domain/repositories/device-repository";
import { DeviceNotFoundError } from "../../errors/device-not-found-error";
import { DeviceOutput } from "../device-output";
import { GetDeviceByIdInput } from "./get-device-by-id-input";

export class GetDeviceByIdUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  public async execute(input: GetDeviceByIdInput): Promise<DeviceOutput> {
    const device = await this.deviceRepository.findById(input.id);

    if (!device) throw new DeviceNotFoundError(input.id);

    return {
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      status: device.status,
      createdAt: device.createdAt,
    };
  }
}
