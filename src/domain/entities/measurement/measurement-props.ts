export interface CreateMeasurementProps {
  deviceId: string;
  value: number;
  recordedAt: Date;
}

export interface RestoreMeasurementProps extends CreateMeasurementProps {
  id: string;
  createdAt: Date;
}
