import { Device } from "../../../../domain/entities/device/device.js";
import type { DeviceRepository } from "../../../../domain/repositories/device-repository.js";
import { db } from "../../../../../prisma/db.js";
import { PrismaDeviceMapper } from "../mappers/prisma-device-mapper.js";

export class PrismaDeviceRepository implements DeviceRepository {
  
  public async create(device: Device): Promise<void> {
    await db.orm.public.Device.create(PrismaDeviceMapper.toPersistence(device));
  }

  public async findById(id: string): Promise<Device | null> {
    const raw = await db.orm.public.Device.where({ id }).first();

    return raw ? PrismaDeviceMapper.toDomain(raw) : null;
  }

  public async findAll(): Promise<Device[]> {
    const rawDevices = await db.orm.public.Device.orderBy([
      (device) => device.createdAt.desc(),
      (device) => device.id.desc(),
    ]).all();

    return rawDevices.map(PrismaDeviceMapper.toDomain);
  }
}
