import { Measurement } from "../../../domain/entities/measurement/measurement";
import { DeviceRepository } from "../../../domain/repositories/device-repository";
import { MeasurementRepository } from "../../../domain/repositories/measurement-repository";
import { RegisterMeasurementInput } from "./register-measurement-input";

export class RegisterMeasurementUseCase {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly measurementRepository: MeasurementRepository,
  ) {}

  public async execute(input: RegisterMeasurementInput): Promise<Measurement> {
    const device = await this.deviceRepository.findById(input.deviceId);

    if (!device) throw new Error("Device not found");

    const measurement = Measurement.create({
      deviceId: input.deviceId,
      value: input.value,
      recordedAt: input.recordedAt,
    });

    await this.measurementRepository.create(measurement);

    return measurement;
  }
}
