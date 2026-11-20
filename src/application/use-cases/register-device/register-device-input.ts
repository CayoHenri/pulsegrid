import type { DeviceType } from "../../../domain/entities/device/device-types.js";

export interface RegisterDeviceInput {
  name: string;
  type: DeviceType;
  location: string;
}
