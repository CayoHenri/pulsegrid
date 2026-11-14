import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryDeviceRepository } from "../../../../src/infrastructure/repositories/in-memory/in-memory-device-repository";
import { GetDeviceByIdUseCase } from "../../../../src/application/use-cases/get-device-by-id/get-device-by-id-use-case";
import { Device } from "../../../../src/domain/entities/device/device";
import { DeviceNotFoundError } from "../../../../src/application/errors/device-not-found-error";

describe("GetDeviceByIdUseCase", () => {
  let repository: InMemoryDeviceRepository;
  let sut: GetDeviceByIdUseCase;

  beforeEach(() => {
    repository = new InMemoryDeviceRepository();
    sut = new GetDeviceByIdUseCase(repository);
  });

  it("should return a device by id", async () => {
    const device = Device.create({
      name: "Sensor 01",
      type: "TEMPERATURE",
      location: "Estufa A",
    });

    await repository.create(device);

    const result = await sut.execute({
      id: device.id,
    });

    expect(result).toEqual({
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      status: device.status,
      createdAt: device.createdAt,
    });
  });

  it("should return persisted inactive devices without changing their data", async () => {
    const props = {
      name: "Sensor",
      type: "PRESSURE" as const,
      location: "Lab",
      status: "INACTIVE" as const,
      createdAt: new Date("2020-01-01"),
    };
    await repository.create(new Device(props, "stored-device"));
    const find = vi.spyOn(repository, "findById");
    expect(await sut.execute({ id: "stored-device" })).toEqual({
      id: "stored-device",
      ...props,
    });
    expect(find).toHaveBeenCalledExactlyOnceWith("stored-device");
  });

  it("should propagate lookup failures", async () => {
    const error = new Error("Database unavailable");
    vi.spyOn(repository, "findById").mockRejectedValueOnce(error);
    await expect(sut.execute({ id: "device-123" })).rejects.toBe(error);
  });

  it("should throw when device does not exist", async () => {
    await expect(
      sut.execute({
        id: "non-existing-device",
      }),
    ).rejects.toBeInstanceOf(DeviceNotFoundError);
  });
});
