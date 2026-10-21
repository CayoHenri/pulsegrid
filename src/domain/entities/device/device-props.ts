import type { DeviceStatus, DeviceType } from "./device-types";

export interface DeviceProps {
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  createdAt: Date;
}
