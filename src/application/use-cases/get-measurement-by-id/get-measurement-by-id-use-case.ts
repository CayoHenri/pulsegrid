import { MeasurementRepository } from "../../../domain/repositories/measurement-repository";
import { MeasurementNotFoundError } from "../../errors/measurement-not-found-error";
import { MeasurementOutput, toMeasurementOutput } from "../measurement-output";
import { GetMeasurementByIdInput } from "./get-measurement-by-id-input";

export class GetMeasurementByIdUseCase {
  constructor(private readonly measurementRepository: MeasurementRepository) {}

  public async execute(input: GetMeasurementByIdInput): Promise<MeasurementOutput> {
    const measurement = await this.measurementRepository.findById(input.id);
    if (!measurement) throw new MeasurementNotFoundError(input.id);
    return toMeasurementOutput(measurement);
  }
}
