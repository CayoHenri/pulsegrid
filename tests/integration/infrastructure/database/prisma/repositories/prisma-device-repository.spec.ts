import { afterAll, afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { Device } from "../../../../../../src/domain/entities/device/device";
import { PrismaDeviceRepository } from "../../../../../../src/infrastructure/database/prisma/repositories/prisma-device-repository";
import { db } from "../../../../../../prisma/db";

describe("PrismaDeviceRepository integration", () => {
  const repository = new PrismaDeviceRepository();
  const createdIds = new Set<string>();

  afterEach(async () => {
    await Promise.all(
      [...createdIds].map((id) => db.orm.public.Device.where({ id }).delete()),
    );
    createdIds.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  it("creates a device and reads it back from PostgreSQL", async () => {
    const device = Device.create({
      name: "Integration Sensor",
      type: "TEMPERATURE",
      location: "Integration Lab",
    });
    createdIds.add(device.id);

    await repository.create(device);
    const result = await repository.findById(device.id);

    expect(result).toBeInstanceOf(Device);
    expect(result).toMatchObject({
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      status: "ACTIVE",
    });
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.createdAt.toISOString()).toBe(
      device.createdAt.toISOString(),
    );
  });

  it("returns null when the device does not exist", async () => {
    const missingId = randomUUID();

    await expect(repository.findById(missingId)).resolves.toBeNull();
  });

  it("lists persisted devices ordered by creation time and then ID descending", async () => {
    const older = new Device({
      name: "Integration Older",
      type: "TEMPERATURE",
      location: "Integration Lab",
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const newer = new Device({
      name: "Integration Newer",
      type: "HUMIDITY",
      location: "Integration Lab",
      status: "ACTIVE",
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });
    createdIds.add(older.id);
    createdIds.add(newer.id);

    await repository.create(older);
    await repository.create(newer);
    const results = await repository.findAll();
    const persistedTestDevices = results.filter((device) =>
      createdIds.has(device.id),
    );

    expect(persistedTestDevices).toHaveLength(2);
    expect(persistedTestDevices.map((device) => device.id)).toEqual([
      newer.id,
      older.id,
    ]);
    expect(
      persistedTestDevices.every((device) => device instanceof Device),
    ).toBe(true);
  });
});
