import { describe, expect, it } from "vitest";
import { Measurement } from "../../../../../src/domain/entities/measurement/measurement.js";
import { PrismaMeasurementMapper } from "../../../../../src/infrastructure/database/prisma/mappers/prisma-measurement-mapper.js";
import type { Models } from "../../../../../prisma/contract.js";

describe("PrismaMeasurementMapper", () => {
  const recordedAtIso = "2026-10-30T15:40:10.456Z";
  const createdAtIso = "2026-10-30T15:45:12.123Z";
  const record = {
    id: "94e7f031-1961-4fc9-9b26-0a1eb47fb247",
    deviceId: "cfb564aa-e59e-4d07-a2c7-482c2b2cbd19",
    value: 23.4,
    recordedAt: recordedAtIso,
    createdAt: createdAtIso,
  } as unknown as Models.public_Measurement;

  it("converts the timestamp strings returned by Prisma into domain Dates", () => {
    const measurement = PrismaMeasurementMapper.toDomain(record);

    expect(measurement).toBeInstanceOf(Measurement);
    expect(measurement.id).toBe(record.id);
    expect(measurement.deviceId).toBe(record.deviceId);
    expect(measurement.value).toBe(record.value);
    expect(measurement.recordedAt).toBeInstanceOf(Date);
    expect(measurement.recordedAt.toISOString()).toBe(recordedAtIso);
    expect(measurement.createdAt).toBeInstanceOf(Date);
    expect(measurement.createdAt.toISOString()).toBe(createdAtIso);
  });

  it("converts the domain Dates into ISO timestamp strings for Prisma", () => {
    const measurement = Measurement.restore({
      id: record.id,
      deviceId: record.deviceId,
      value: record.value,
      recordedAt: new Date(recordedAtIso),
      createdAt: new Date(createdAtIso),
    });

    const persistence = PrismaMeasurementMapper.toPersistence(measurement);

    expect(persistence).toEqual({
      id: record.id,
      deviceId: record.deviceId,
      value: record.value,
      recordedAt: recordedAtIso,
      createdAt: createdAtIso,
    });
  });
});
