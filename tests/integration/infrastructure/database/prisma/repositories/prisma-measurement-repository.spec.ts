import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { Device } from "../../../../../../src/domain/entities/device/device.js";
import { Measurement } from "../../../../../../src/domain/entities/measurement/measurement.js";
import { PrismaDeviceRepository } from "../../../../../../src/infrastructure/database/prisma/repositories/prisma-device-repository.js";
import { PrismaMeasurementRepository } from "../../../../../../src/infrastructure/database/prisma/repositories/prisma-measurement-repository.js";
import { db } from "../../../../../../prisma/db.js";

describe("PrismaMeasurementRepository integration", () => {
  const measurementRepository = new PrismaMeasurementRepository();
  const deviceRepository = new PrismaDeviceRepository();
  const createdMeasurementIds = new Set<string>();
  const createdDeviceIds = new Set<string>();

  afterEach(async () => {
    await Promise.all(
      [...createdMeasurementIds].map((id) =>
        db.orm.public.Measurement.where({ id }).delete(),
      ),
    );
    createdMeasurementIds.clear();

    await Promise.all(
      [...createdDeviceIds].map((id) =>
        db.orm.public.Device.where({ id }).delete(),
      ),
    );
    createdDeviceIds.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  const createDevice = async (): Promise<Device> => {
    const device = Device.create({
      name: "Integration Temperature Sensor",
      type: "TEMPERATURE",
      location: "Integration Lab",
    });
    createdDeviceIds.add(device.id);
    await deviceRepository.create(device);
    return device;
  };

  const createMeasurement = (
    deviceId: string,
    recordedAt: string,
  ): Measurement => {
    const measurement = Measurement.restore({
      id: randomUUID(),
      deviceId,
      value: 23.4,
      recordedAt: new Date(recordedAt),
      createdAt: new Date("2026-11-18T12:00:00.000Z"),
    });
    createdMeasurementIds.add(measurement.id);
    return measurement;
  };

  it("creates a measurement and reads it back from PostgreSQL", async () => {
    const device = await createDevice();
    const measurement = createMeasurement(
      device.id,
      "2026-11-18T11:45:00.456Z",
    );

    await measurementRepository.create(measurement);
    const result = await measurementRepository.findById(measurement.id);

    expect(result).toBeInstanceOf(Measurement);
    expect(result).toMatchObject({
      id: measurement.id,
      deviceId: device.id,
      value: measurement.value,
    });
    expect(result?.recordedAt).toBeInstanceOf(Date);
    expect(result?.recordedAt.toISOString()).toBe(
      measurement.recordedAt.toISOString(),
    );
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.createdAt.toISOString()).toBe(
      measurement.createdAt.toISOString(),
    );
  });

  it("returns null when a measurement does not exist", async () => {
    await expect(
      measurementRepository.findById(randomUUID()),
    ).resolves.toBeNull();
  });

  it("lists only a device's measurements ordered by recorded time descending", async () => {
    const device = await createDevice();
    const otherDevice = await createDevice();
    const older = createMeasurement(device.id, "2026-11-17T10:00:00.000Z");
    const newer = createMeasurement(device.id, "2026-11-18T10:00:00.000Z");
    const unrelated = createMeasurement(
      otherDevice.id,
      "2026-11-19T10:00:00.000Z",
    );

    await measurementRepository.create(older);
    await measurementRepository.create(newer);
    await measurementRepository.create(unrelated);

    const results = await measurementRepository.findByDeviceId(device.id);

    expect(results.map((measurement) => measurement.id)).toEqual([
      newer.id,
      older.id,
    ]);
    expect(
      results.every((measurement) => measurement instanceof Measurement),
    ).toBe(true);
  });
});
