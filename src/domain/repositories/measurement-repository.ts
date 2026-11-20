import { Measurement } from "../entities/measurement/measurement";

export interface MeasurementRepository {
  create(measurement: Measurement): Promise<void>;
  findById(id: string): Promise<Measurement | null>;
  findByDeviceId(deviceId: string): Promise<Measurement[]>;
}
