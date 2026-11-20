import { Measurement } from "../entities/measurement/measurement.js";

export interface MeasurementRepository {
  create(measurement: Measurement): Promise<void>;
  findById(id: string): Promise<Measurement | null>;
  findByDeviceId(deviceId: string): Promise<Measurement[]>;
}
