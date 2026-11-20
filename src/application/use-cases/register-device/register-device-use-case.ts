import { Device } from "../../../domain/entities/device/device";
import type { DeviceRepository } from "../../../domain/repositories/device-repository";
import { DeviceOutput, toDeviceOutput } from "../device-output";
import type { RegisterDeviceInput } from "./register-device-input";

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
