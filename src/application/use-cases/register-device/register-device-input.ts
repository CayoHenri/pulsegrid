import type { DeviceType } from "../../../domain/entities/device/device-types";

export interface RegisterDeviceInput {
  name: string;
  type: DeviceType;
  location: string;
}
