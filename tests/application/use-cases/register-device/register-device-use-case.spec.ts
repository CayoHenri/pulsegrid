import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "../../../../src/domain/errors/domain-error";
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
    expect(result).toEqual({
      id: devices[0].id, name: devices[0].name, type: devices[0].type,
      location: devices[0].location, status: devices[0].status, createdAt: devices[0].createdAt,
    });
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should persist and return normalized fields", async () => {
    const result = await sut.execute({ name: "  Sensor  ", type: "PRESSURE", location: "  Lab  " });
    const stored = await repository.findById(result.id);
    expect(result.name).toBe("Sensor");
    expect(result.location).toBe("Lab");
    expect(stored?.name).toBe("Sensor");
    expect(stored?.location).toBe("Lab");
  });

  it.each([{ name: "", location: "Lab" }, { name: " \t", location: "Lab" },
    { name: "Sensor", location: "" }, { name: "Sensor", location: " \n" }])(
    "should not persist invalid input %j", async (input) => {
      const create = vi.spyOn(repository, "create");
      await expect(sut.execute({ ...input, type: "TEMPERATURE" })).rejects.toBeInstanceOf(DomainError);
      expect(create).not.toHaveBeenCalled();
    },
  );

  it("should propagate persistence failures", async () => {
    const error = new Error("Database unavailable");
    vi.spyOn(repository, "create").mockRejectedValueOnce(error);
    await expect(sut.execute({ name: "Sensor", type: "HUMIDITY", location: "Lab" })).rejects.toBe(error);
  });
});
