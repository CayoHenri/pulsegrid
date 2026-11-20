import { DeviceRepository } from "../../../domain/repositories/device-repository.js";
import { DeviceOutput, toDeviceOutput } from "../device-output.js";

export class ListDevicesUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  public async execute(): Promise<DeviceOutput[]> {
    const devices = await this.deviceRepository.findAll();

    return devices.map(toDeviceOutput);
  }
}
