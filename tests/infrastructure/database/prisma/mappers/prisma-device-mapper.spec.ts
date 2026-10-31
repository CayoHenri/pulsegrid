import { describe, expect, it } from "vitest";
import { Device } from "../../../../../src/domain/entities/device/device";
import { PrismaDeviceMapper } from "../../../../../src/infrastructure/database/prisma/mappers/prisma-device-mapper";
import type { Models } from "../../../../../prisma/contract";

describe("PrismaDeviceMapper", () => {
  const createdAtIso = "2026-10-30T15:45:12.123Z";
  const record = {
    id: "94e7f031-1961-4fc9-9b26-0a1eb47fb247",
    name: "Sensor 01",
    type: "TEMPERATURE",
    location: "Estufa A",
    status: "ACTIVE",
    createdAt: createdAtIso,
  } as unknown as Models.public_Device;

  it("converts the timestamp string returned by Prisma into a domain Date", () => {
    const device = PrismaDeviceMapper.toDomain(record);

    expect(device).toBeInstanceOf(Device);
    expect(device.id).toBe(record.id);
    expect(device.createdAt).toBeInstanceOf(Date);
    expect(device.createdAt.toISOString()).toBe(createdAtIso);
  });

  it("converts the domain Date into an ISO timestamp string for Prisma", () => {
    const device = new Device(
      {
        name: record.name,
        type: record.type,
        location: record.location,
        status: record.status,
        createdAt: new Date(createdAtIso),
      },
      record.id,
    );

    const persistence = PrismaDeviceMapper.toPersistence(device);

    expect(persistence.createdAt).toBe(createdAtIso);
  });
});
