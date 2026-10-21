import {
  DeviceStatus,
  DeviceType,
} from "../../domain/entities/device/device-types";

export interface DeviceOutput {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  createdAt: Date;
}
