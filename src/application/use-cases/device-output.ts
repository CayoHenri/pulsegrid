import {
  DeviceStatus,
  DeviceType,
} from "../../domain/entities/device/device-types";
import { Device } from "../../domain/entities/device/device";

export interface DeviceOutput {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  createdAt: Date;
}

export const toDeviceOutput = (device: Device): DeviceOutput => ({
  id: device.id,
  name: device.name,
  type: device.type,
  location: device.location,
  status: device.status,
  createdAt: device.createdAt,
});
