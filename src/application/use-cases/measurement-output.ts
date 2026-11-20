import { Measurement } from "../../domain/entities/measurement/measurement";

export interface MeasurementOutput {
  id: string;
  deviceId: string;
  value: number;
  recordedAt: Date;
  createdAt: Date;
}

export const toMeasurementOutput = (
  measurement: Measurement,
): MeasurementOutput => ({
  id: measurement.id,
  deviceId: measurement.deviceId,
  value: measurement.value,
  recordedAt: measurement.recordedAt,
  createdAt: measurement.createdAt,
});
