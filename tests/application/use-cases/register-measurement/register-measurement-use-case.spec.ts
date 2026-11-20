import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterMeasurementUseCase } from "../../../../src/application/use-cases/register-measurement/register-measurement-use-case";
import { Device } from "../../../../src/domain/entities/device/device";
import { Measurement } from "../../../../src/domain/entities/measurement/measurement";
import type { MeasurementRepository } from "../../../../src/domain/repositories/measurement-repository";
import { InMemoryDeviceRepository } from "../../../../src/infrastructure/repositories/in-memory/in-memory-device-repository";

describe("RegisterMeasurementUseCase", () => {
  let deviceRepository: InMemoryDeviceRepository;
  let measurementRepository: {
    create: ReturnType<typeof vi.fn<MeasurementRepository["create"]>>;
    findById: ReturnType<typeof vi.fn<MeasurementRepository["findById"]>>;
    findByDeviceId: ReturnType<
      typeof vi.fn<MeasurementRepository["findByDeviceId"]>
    >;
  };
  let sut: RegisterMeasurementUseCase;

  beforeEach(() => {
    deviceRepository = new InMemoryDeviceRepository();
    measurementRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByDeviceId: vi.fn(),
    };

    sut = new RegisterMeasurementUseCase(
      deviceRepository,
      measurementRepository,
    );
  });

  it("should register a measurement when the device exists", async () => {
    const device = Device.create({
      name: "Sensor 01",
      type: "TEMPERATURE",
      location: "Estufa A",
    });

    await deviceRepository.create(device);

    const recordedAt = new Date("2026-11-11T12:00:00.000Z");

    const result = await sut.execute({
      deviceId: device.id,
      value: 23.4,
      recordedAt,
    });

    expect(result).toBeInstanceOf(Measurement);
    expect(result.deviceId).toBe(device.id);
    expect(result.value).toBe(23.4);
    expect(result.recordedAt).toEqual(recordedAt);
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeInstanceOf(Date);

    expect(measurementRepository.create).toHaveBeenCalledTimes(1);
    expect(measurementRepository.create.mock.calls[0][0]).toBe(result);
    expect(measurementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: device.id,
        value: 23.4,
        recordedAt,
      }),
    );
  });

  it("should throw when the device does not exist", async () => {
    const recordedAt = new Date("2026-11-11T12:00:00.000Z");

    await expect(
      sut.execute({
        deviceId: "non-existing-device",
        value: 18.7,
        recordedAt,
      }),
    ).rejects.toThrow('Device with id "non-existing-device" was not found.');

    expect(measurementRepository.create).not.toHaveBeenCalled();
  });

  it.each([
    {
      value: NaN,
      recordedAt: new Date("2026-11-11"),
      message: "Measurement value must be finite",
    },
    {
      value: Infinity,
      recordedAt: new Date("2026-11-11"),
      message: "Measurement value must be finite",
    },
    {
      value: -Infinity,
      recordedAt: new Date("2026-11-11"),
      message: "Measurement value must be finite",
    },
    {
      value: 10,
      recordedAt: new Date(NaN),
      message: "Invalid measurement date",
    },
  ])(
    "should not persist invalid measurement $message ($value)",
    async ({ value, recordedAt, message }) => {
      const device = Device.create({
        name: "Sensor",
        type: "TEMPERATURE",
        location: "Lab",
      });
      await deviceRepository.create(device);
      await expect(
        sut.execute({ deviceId: device.id, value, recordedAt }),
      ).rejects.toThrow(message);
      expect(measurementRepository.create).not.toHaveBeenCalled();
    },
  );

  it("should propagate device lookup failures without persisting", async () => {
    const error = new Error("Lookup failed");
    const find = vi
      .spyOn(deviceRepository, "findById")
      .mockRejectedValueOnce(error);
    await expect(
      sut.execute({ deviceId: "device-123", value: 0, recordedAt: new Date() }),
    ).rejects.toBe(error);
    expect(find).toHaveBeenCalledExactlyOnceWith("device-123");
    expect(measurementRepository.create).not.toHaveBeenCalled();
  });

  it("should propagate measurement persistence failures", async () => {
    const device = Device.create({
      name: "Sensor",
      type: "TEMPERATURE",
      location: "Lab",
    });
    await deviceRepository.create(device);
    const error = new Error("Persistence failed");
    measurementRepository.create.mockRejectedValueOnce(error);
    await expect(
      sut.execute({ deviceId: device.id, value: -1, recordedAt: new Date() }),
    ).rejects.toBe(error);
    expect(measurementRepository.create).toHaveBeenCalledTimes(1);
  });
});
