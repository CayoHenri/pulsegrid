import { Device } from "../entities/device/device";

export interface DeviceRepository {
  create(device: Device): Promise<void>;
  findById(id: string): Promise<Device | null>;
  findAll(): Promise<Device[]>;
}
