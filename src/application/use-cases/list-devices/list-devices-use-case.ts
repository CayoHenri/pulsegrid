import { DeviceRepository } from "../../../domain/repositories/device-repository";
import { DeviceOutput, toDeviceOutput } from "../device-output";

export class ListDevicesUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  public async execute(): Promise<DeviceOutput[]> {
    const devices = await this.deviceRepository.findAll();

    return devices.map(toDeviceOutput);
  }
}
