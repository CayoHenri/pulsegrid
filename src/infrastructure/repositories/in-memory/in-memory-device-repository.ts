import { Device } from "../../../domain/entities/device/device";
import { DeviceRepository } from "../../../domain/repositories/device-repository";

export class InMemoryDeviceRepository implements DeviceRepository {
  private readonly devices: Device[] = [];

  public async create(device: Device): Promise<void> {
    this.devices.push(device);
  }

  public async findById(id: string): Promise<Device | null> {
    return this.devices.find((device) => device.id === id) ?? null;
  }

  public async findAll(): Promise<Device[]> {
    return [...this.devices];
  }
}
