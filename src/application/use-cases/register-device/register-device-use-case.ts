import { Device } from "../../../domain/entities/device/device.js";
import type { DeviceRepository } from "../../../domain/repositories/device-repository.js";
import { DeviceOutput, toDeviceOutput } from "../device-output.js";
import type { RegisterDeviceInput } from "./register-device-input.js";

export class RegisterDeviceUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  public async execute(input: RegisterDeviceInput): Promise<DeviceOutput> {
    const device = Device.create({
      name: input.name,
      type: input.type,
      location: input.location,
    });

    await this.deviceRepository.create(device);

    return toDeviceOutput(device);
  }
}
