import { describe, expect, it, vi } from "vitest";
import { GetMeasurementByIdUseCase } from "../../../../src/application/use-cases/get-measurement-by-id/get-measurement-by-id-use-case";
import { MeasurementNotFoundError } from "../../../../src/application/errors/measurement-not-found-error";
import { Measurement } from "../../../../src/domain/entities/measurement/measurement";

describe("GetMeasurementByIdUseCase", () => {
  it("returns a measurement output when found", async () => {
    const measurement = Measurement.create({ deviceId: "device-1", value: 18.5, recordedAt: new Date("2026-11-19T10:00:00Z") });
    const repository = { create: vi.fn(), findById: vi.fn().mockResolvedValue(measurement), findByDeviceId: vi.fn() };
    const result = await new GetMeasurementByIdUseCase(repository).execute({ id: measurement.id });
    expect(result).toMatchObject({ id: measurement.id, deviceId: "device-1", value: 18.5 });
    expect(repository.findById).toHaveBeenCalledExactlyOnceWith(measurement.id);
  });

  it("throws a not found error when the measurement is absent", async () => {
    const repository = { create: vi.fn(), findById: vi.fn().mockResolvedValue(null), findByDeviceId: vi.fn() };
    await expect(new GetMeasurementByIdUseCase(repository).execute({ id: "missing" })).rejects.toBeInstanceOf(MeasurementNotFoundError);
  });
});
