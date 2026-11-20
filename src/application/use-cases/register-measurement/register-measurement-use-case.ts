import { Measurement } from "../../../domain/entities/measurement/measurement.js";
import { DeviceRepository } from "../../../domain/repositories/device-repository.js";
import { MeasurementRepository } from "../../../domain/repositories/measurement-repository.js";
import { DeviceNotFoundError } from "../../errors/device-not-found-error.js";
import { RegisterMeasurementInput } from "./register-measurement-input.js";

export class RegisterMeasurementUseCase {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly measurementRepository: MeasurementRepository,
  ) {}

  public async execute(input: RegisterMeasurementInput): Promise<Measurement> {
    const device = await this.deviceRepository.findById(input.deviceId);

    if (!device) throw new DeviceNotFoundError(input.deviceId);

    const measurement = Measurement.create({
      deviceId: input.deviceId,
      value: input.value,
      recordedAt: input.recordedAt,
    });

    await this.measurementRepository.create(measurement);

    return measurement;
  }
}
