import { afterEach, describe, expect, it, vi } from "vitest";
import { Device } from "../../../src/domain/entities/device/device";
import { DomainError } from "../../../src/domain/errors/domain-error";

describe("Device", () => {
  afterEach(() => vi.useRealTimers());

  it("should generate distinct UUIDs and use the current creation time", () => {
    vi.useFakeTimers();
    const now = new Date("2026-11-11T12:00:00Z");
    vi.setSystemTime(now);
    const props = {
      name: "Sensor",
      type: "PRESSURE" as const,
      location: "Lab",
    };
    const device = Device.create(props);
    expect(device.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(device.id).not.toBe(Device.create(props).id);
    expect(device.createdAt).toEqual(now);
    expect(device.type).toBe("PRESSURE");
  });

  it("should preserve persisted identity, status and creation date", () => {
    const props = {
      name: "  Sensor  ",
      type: "MULTI_SENSOR" as const,
      location: "  Lab  ",
      status: "INACTIVE" as const,
      createdAt: new Date("2020-01-01T00:00:00Z"),
    };
    const device = new Device(props, "persisted-id");
    expect(device.id).toBe("persisted-id");
    expect(device.status).toBe("INACTIVE");
    expect(device.createdAt).toEqual(props.createdAt);
    expect(device.type).toBe("MULTI_SENSOR");
    expect(device.name).toBe("Sensor");
    expect(device.location).toBe("Lab");
    expect(props.name).toBe("  Sensor  ");
    props.name = "Changed";
    expect(device.name).toBe("Sensor");
  });

  it.each(["", "   ", "\t\n"])(
    "should reject blank names and locations (%j)",
    (blank) => {
      const props = {
        name: "Sensor",
        type: "TEMPERATURE" as const,
        location: "Lab",
      };
      expect(() => Device.create({ ...props, name: blank })).toThrow(
        "Device name cannot be empty.",
      );
      expect(() => Device.create({ ...props, location: blank })).toThrow(
        "Device location cannot be empty.",
      );
    },
  );
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
