import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryDeviceRepository } from "../../../../src/infrastructure/repositories/in-memory/in-memory-device-repository";
import { ListDevicesUseCase } from "../../../../src/application/use-cases/list-devices/list-devices-use-case";
import { Device } from "../../../../src/domain/entities/device/device";

describe("ListDevicesUseCase", () => {
  let repository: InMemoryDeviceRepository;
  let sut: ListDevicesUseCase;

  beforeEach(() => {
    repository = new InMemoryDeviceRepository();
    sut = new ListDevicesUseCase(repository);
  });

  it("should return a list of devices", async () => {
    const device1 = Device.create({
      name: "Sensor 01",
      type: "TEMPERATURE",
      location: "Estufa A",
    });

    const device2 = Device.create({
      name: "Sensor 02",
      type: "HUMIDITY",
      location: "Estufa B",
    });

    await repository.create(device1);
    await repository.create(device2);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(device1.id);
    expect(result[1].id).toBe(device2.id);
  });
});
