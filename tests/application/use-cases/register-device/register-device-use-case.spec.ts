import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryDeviceRepository } from "../../../../src/infrastructure/repositories/in-memory/in-memory-device-repository";
import { RegisterDeviceUseCase } from "../../../../src/application/use-cases/register-device/register-device-use-case";

describe("RegisterDeviceUseCase", () => {
  let repository: InMemoryDeviceRepository;
  let sut: RegisterDeviceUseCase;

  beforeEach(() => {
    repository = new InMemoryDeviceRepository();
    sut = new RegisterDeviceUseCase(repository);
  });

  it("should register a device", async () => {
    const result = await sut.execute({
      name: "Sensor Estufa 01",
      type: "TEMPERATURE",
      location: "Estufa A",
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Sensor Estufa 01");
    expect(result.type).toBe("TEMPERATURE");
    expect(result.location).toBe("Estufa A");
    expect(result.status).toBe("ACTIVE");

    const devices = await repository.findAll();

    expect(devices).toHaveLength(1);
  });
});
