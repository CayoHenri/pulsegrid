import { DeviceRepository } from "../../../domain/repositories/device-repository";
import { DeviceOutput } from "../device-output";

export class ListDevicesUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  public async execute(): Promise<DeviceOutput[]> {
    const devices = await this.deviceRepository.findAll();

    return devices.map((device) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      status: device.status,
      createdAt: device.createdAt,
    }));
  }
}
