import { describe, expect, it } from "vitest";
import { Device } from "../../../src/domain/entities/device/device";
import { DomainError } from "../../../src/domain/errors/domain-error";

describe("Device", () => {
  it("should create an active device", () => {
    const device = Device.create({
      name: "Sensor 01",
      type: "TEMPERATURE",
      location: "Estufa A",
    });

    expect(device.id).toBeDefined();
    expect(device.status).toBe("ACTIVE");
    expect(device.name).toBe("Sensor 01");
  });

  it("should not create a device with an empty name", () => {
    expect(() =>
      Device.create({
        name: "",
        type: "TEMPERATURE",
        location: "Estufa A",
      }),
    ).toThrow(DomainError);
  });

  it("should not create a device with an empty location", () => {
    expect(() =>
      Device.create({
        name: "Sensor 01",
        type: "TEMPERATURE",
        location: "   ",
      }),
    ).toThrow(DomainError);
  });

  it("should trim device name and location", () => {
    const device = Device.create({
      name: "  Sensor 01  ",
      type: "TEMPERATURE",
      location: "  Estufa A  ",
    });

    expect(device.name).toBe("Sensor 01");
    expect(device.location).toBe("Estufa A");
  });
});
