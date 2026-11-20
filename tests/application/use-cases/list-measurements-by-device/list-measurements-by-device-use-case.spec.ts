import { describe, expect, it, vi } from "vitest";
import { ListMeasurementsByDeviceUseCase } from "../../../../src/application/use-cases/list-measurements-by-device/list-measurements-by-device-use-case.js";
import { Device } from "../../../../src/domain/entities/device/device.js";
import { Measurement } from "../../../../src/domain/entities/measurement/measurement.js";
import { InMemoryDeviceRepository } from "../../../../src/infrastructure/repositories/in-memory/in-memory-device-repository.js";

describe("ListMeasurementsByDeviceUseCase", () => {
  it("returns measurements for an existing device", async () => {
    const devices = new InMemoryDeviceRepository();
    const device = Device.create({ name: "Sensor", type: "TEMPERATURE", location: "Lab" });
    await devices.create(device);
    const measurement = Measurement.create({ deviceId: device.id, value: 20, recordedAt: new Date("2026-11-19T10:00:00Z") });
    const measurements = { create: vi.fn(), findById: vi.fn(), findByDeviceId: vi.fn().mockResolvedValue([measurement]) };
    const result = await new ListMeasurementsByDeviceUseCase(devices, measurements).execute({ deviceId: device.id });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: measurement.id, value: 20 });
    expect(measurements.findByDeviceId).toHaveBeenCalledExactlyOnceWith(device.id);
  });

  it("throws when the device does not exist without querying measurements", async () => {
    const devices = new InMemoryDeviceRepository();
    const measurements = { create: vi.fn(), findById: vi.fn(), findByDeviceId: vi.fn() };
    await expect(new ListMeasurementsByDeviceUseCase(devices, measurements).execute({ deviceId: "missing" })).rejects.toThrow('Device with id "missing" was not found.');
    expect(measurements.findByDeviceId).not.toHaveBeenCalled();
  });
});
