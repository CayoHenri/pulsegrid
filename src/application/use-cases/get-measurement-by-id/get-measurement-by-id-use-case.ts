import { MeasurementRepository } from "../../../domain/repositories/measurement-repository.js";
import { MeasurementNotFoundError } from "../../errors/measurement-not-found-error.js";
import { MeasurementOutput, toMeasurementOutput } from "../measurement-output.js";
import { GetMeasurementByIdInput } from "./get-measurement-by-id-input.js";

export class GetMeasurementByIdUseCase {
  constructor(private readonly measurementRepository: MeasurementRepository) {}

  public async execute(input: GetMeasurementByIdInput): Promise<MeasurementOutput> {
    const measurement = await this.measurementRepository.findById(input.id);
    if (!measurement) throw new MeasurementNotFoundError(input.id);
    return toMeasurementOutput(measurement);
  }
}
