import type { DeviceStatus, DeviceType } from "./device-types.js";

export interface DeviceProps {
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  createdAt: Date;
}
