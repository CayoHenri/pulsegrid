import { afterEach, describe, expect, it, vi } from "vitest";
import { Measurement } from "../../../src/domain/entities/measurement/measurement.js";

describe("Measurement", () => {
  afterEach(() => vi.useRealTimers());

  it("should generate distinct UUIDs and capture the current time", () => {
    vi.useFakeTimers();
    const now = new Date("2026-11-11T12:00:00Z");
    vi.setSystemTime(now);
    const props = { deviceId: "device-123", value: 0, recordedAt: new Date("2020-01-01") };
    const measurement = Measurement.create(props);
    expect(measurement.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(measurement.id).not.toBe(Measurement.create(props).id);
    expect(measurement.createdAt).toEqual(now);
  });

  describe.each(["create", "restore"] as const)("%s", (method) => {
    const valid = () => ({
      id: "measurement-123", deviceId: "device-123", value: 22.5,
      recordedAt: new Date("2026-11-10T12:00:00Z"),
      createdAt: new Date("2026-11-11T12:00:00Z"),
    });

    it.each(["", "   ", "\t\n"])("should reject blank device IDs (%j)", (deviceId) => {
      expect(() => Measurement[method]({ ...valid(), deviceId })).toThrow("Device ID is required");
    });

    it.each([NaN, Infinity, -Infinity])("should reject non-finite value %s", (value) => {
      expect(() => Measurement[method]({ ...valid(), value })).toThrow("Measurement value must be finite");
    });

    it.each([0, -22.5, 0.001, Number.MAX_VALUE])("should accept finite value %s", (value) => {
      expect(Measurement[method]({ ...valid(), value }).value).toBe(value);
    });

    it("should reject an invalid recorded date", () => {
      expect(() => Measurement[method]({ ...valid(), recordedAt: new Date(NaN) })).toThrow("Invalid measurement date");
    });

    it("should copy the supplied dates", () => {
      const props = valid();
      const measurement = Measurement[method](props);
      props.recordedAt.setTime(0);
      props.createdAt.setTime(0);
      expect(measurement.recordedAt).toEqual(new Date("2026-11-10T12:00:00Z"));
      if (method === "restore") {
        expect(measurement.createdAt).toEqual(new Date("2026-11-11T12:00:00Z"));
      }
    });
  });
  it("should create a valid measurement", () => {
    const recordedAt = new Date("2026-11-11T12:00:00.000Z");

    const measurement = Measurement.create({
      deviceId: "device-123",
      value: 22.5,
      recordedAt,
    });

    expect(measurement.id).toBeDefined();
    expect(measurement.deviceId).toBe("device-123");
    expect(measurement.value).toBe(22.5);
    expect(measurement.recordedAt).toEqual(recordedAt);
    expect(measurement.createdAt).toBeInstanceOf(Date);
  });

  it("should not create a measurement with an empty device id", () => {
    expect(() =>
      Measurement.create({
        deviceId: "   ",
        value: 22.5,
        recordedAt: new Date("2026-11-11T12:00:00.000Z"),
      }),
    ).toThrow("Device ID is required");
  });

  it("should not create a measurement with a non-finite value", () => {
    expect(() =>
      Measurement.create({
        deviceId: "device-123",
        value: Number.NaN,
        recordedAt: new Date("2026-11-11T12:00:00.000Z"),
      }),
    ).toThrow("Measurement value must be finite");
  });

  it("should not create a measurement with an invalid recorded date", () => {
    expect(() =>
      Measurement.create({
        deviceId: "device-123",
        value: 22.5,
        recordedAt: new Date("invalid-date"),
      }),
    ).toThrow("Invalid measurement date");
  });

  it("should restore a measurement from persisted data", () => {
    const createdAt = new Date("2026-11-10T10:00:00.000Z");
    const recordedAt = new Date("2026-11-11T12:00:00.000Z");

    const measurement = Measurement.restore({
      id: "measurement-123",
      deviceId: "device-123",
      value: 18.2,
      recordedAt,
      createdAt,
    });

    expect(measurement.id).toBe("measurement-123");
    expect(measurement.deviceId).toBe("device-123");
    expect(measurement.value).toBe(18.2);
    expect(measurement.recordedAt).toEqual(recordedAt);
    expect(measurement.createdAt).toEqual(createdAt);
  });
});
