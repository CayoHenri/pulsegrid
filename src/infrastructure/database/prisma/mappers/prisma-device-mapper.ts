import type { CreateInput } from "@prisma/orm-postgres/orm-client";
import type { Contract, Models } from "../../../../../prisma/contract";
import { Device } from "../../../../domain/entities/device/device";

type PrismaDeviceRecord = Models.public_Device;
type PrismaDeviceInput = CreateInput<Contract, "Device">;

export class PrismaDeviceMapper {
  public static toDomain(raw: PrismaDeviceRecord): Device {
    return new Device(
      {
        name: raw.name,
        type: raw.type,
        location: raw.location,
        status: raw.status,
        createdAt: new Date(raw.createdAt),
      },
      raw.id,
    );
  }

  public static toPersistence(device: Device): PrismaDeviceInput {
    return {
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      status: device.status,
      createdAt: device.createdAt.toISOString(),
    };
  }
}
