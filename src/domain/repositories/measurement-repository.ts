import { Measurement } from "../entities/measurement/measurement.js";
import type { CursorPaginationOptions } from "../pagination/cursor-pagination.js";

export interface MeasurementCursor {
  recordedAt: string;
  id: string;
}

export interface FindMeasurementsOptions extends CursorPaginationOptions<MeasurementCursor> {
  deviceId: string;
  from?: Date;
  to?: Date;
}

export interface MeasurementRepository {
  create(measurement: Measurement): Promise<void>;
  findById(id: string): Promise<Measurement | null>;
  findByDeviceId(options: FindMeasurementsOptions): Promise<Measurement[]>;
}
