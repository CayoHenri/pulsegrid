import { Measurement } from "../../../domain/entities/measurement/measurement";
import { MeasurementRepository } from "../../../domain/repositories/measurement-repository";

export class InMemoryMeasurementRepository implements MeasurementRepository {
  private readonly measurements: Measurement[] = [];

  public async create(measurement: Measurement): Promise<void> {
    this.measurements.push(measurement);
  }

  public async findById(id: string): Promise<Measurement | null> {
    return this.measurements.find((measurement) => measurement.id === id) ?? null;
  }

  public async findByDeviceId(deviceId: string): Promise<Measurement[]> {
    return this.measurements
      .filter((measurement) => measurement.deviceId === deviceId)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime() || b.id.localeCompare(a.id));
  }
}
