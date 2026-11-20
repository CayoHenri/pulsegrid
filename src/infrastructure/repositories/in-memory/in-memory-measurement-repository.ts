import { Measurement } from "../../../domain/entities/measurement/measurement.js";
import { MeasurementRepository } from "../../../domain/repositories/measurement-repository.js";
import type { FindMeasurementsOptions } from "../../../domain/repositories/measurement-repository.js";

export class InMemoryMeasurementRepository implements MeasurementRepository {
  private readonly measurements: Measurement[] = [];

  public async create(measurement: Measurement): Promise<void> {
    this.measurements.push(measurement);
  }

  public async findById(id: string): Promise<Measurement | null> {
    return (
      this.measurements.find((measurement) => measurement.id === id) ?? null
    );
  }

  public async findByDeviceId(
    options: FindMeasurementsOptions,
  ): Promise<Measurement[]> {
    const ordered = this.measurements
      .filter((measurement) => measurement.deviceId === options.deviceId)
      .filter(
        (measurement) =>
          !options.from || measurement.recordedAt >= options.from,
      )
      .filter(
        (measurement) => !options.to || measurement.recordedAt <= options.to,
      )
      .sort(
        (a, b) =>
          b.recordedAt.getTime() - a.recordedAt.getTime() ||
          b.id.localeCompare(a.id),
      );

    const afterCursor = options.cursor
      ? ordered.filter(
          (measurement) =>
            measurement.recordedAt.toISOString() < options.cursor!.recordedAt ||
            (measurement.recordedAt.toISOString() ===
              options.cursor!.recordedAt &&
              measurement.id.localeCompare(options.cursor!.id) < 0),
        )
      : ordered;

    return afterCursor.slice(0, options.limit);
  }
}
