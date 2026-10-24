import { beforeEach, describe, expect, it } from "vitest";
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

    expect(result.id).toBe(device.id);
    expect(result.name).toBe("Sensor 01");
  });

  it("should throw when device does not exist", async () => {
    await expect(
      sut.execute({
        id: "non-existing-device",
      }),
    ).rejects.toBeInstanceOf(DeviceNotFoundError);
  });
});
