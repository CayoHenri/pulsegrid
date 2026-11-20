import { DeviceRepository } from "../../../domain/repositories/device-repository.js";
import { DeviceNotFoundError } from "../../errors/device-not-found-error.js";
import { DeviceOutput, toDeviceOutput } from "../device-output.js";
import { GetDeviceByIdInput } from "./get-device-by-id-input.js";

export class GetDeviceByIdUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  public async execute(input: GetDeviceByIdInput): Promise<DeviceOutput> {
    const device = await this.deviceRepository.findById(input.id);

    if (!device) throw new DeviceNotFoundError(input.id);

    return toDeviceOutput(device);
  }
}
