import { DeviceRepository } from "../../../domain/repositories/device-repository.js";
import { MeasurementRepository } from "../../../domain/repositories/measurement-repository.js";
import { DeviceNotFoundError } from "../../errors/device-not-found-error.js";
import { MeasurementOutput, toMeasurementOutput } from "../measurement-output.js";
import { ListMeasurementsByDeviceInput } from "./list-measurements-by-device-input.js";

export class ListMeasurementsByDeviceUseCase {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly measurementRepository: MeasurementRepository,
  ) {}

  public async execute(input: ListMeasurementsByDeviceInput): Promise<MeasurementOutput[]> {
    const device = await this.deviceRepository.findById(input.deviceId);
    if (!device) throw new DeviceNotFoundError(input.deviceId);
    const measurements = await this.measurementRepository.findByDeviceId(input.deviceId);
    return measurements.map(toMeasurementOutput);
  }
}
