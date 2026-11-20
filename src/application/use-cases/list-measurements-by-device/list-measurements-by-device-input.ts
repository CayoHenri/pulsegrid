export interface ListMeasurementsByDeviceInput {
  deviceId: string;
  limit?: number;
  from?: string;
  to?: string;
  cursor?: string;
}
