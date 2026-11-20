import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/app";
import { InMemoryDeviceRepository } from "../src/infrastructure/repositories/in-memory/in-memory-device-repository";
import { InMemoryMeasurementRepository } from "../src/infrastructure/repositories/in-memory/in-memory-measurement-repository";

describe("HTTP API", () => {
  const apps: App[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.getServer().close()));
  });

  const createApp = (): App => {
    const app = new App(
      new InMemoryDeviceRepository(),
      undefined,
      new InMemoryMeasurementRepository(),
    );
    apps.push(app);
    return app;
  };

  it("serves root and health endpoints", async () => {
    const app = createApp();

    const root = await app.getServer().inject({ method: "GET", url: "/" });
    const health = await app
      .getServer()
      .inject({ method: "GET", url: "/health" });

    expect(root.statusCode).toBe(200);
    expect(root.json()).toEqual({ name: "PulseGrid API", status: "running" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok" });
  });

  it("registers, lists, and fetches a device", async () => {
    const app = createApp();
    const created = await app.getServer().inject({
      method: "POST",
      url: "/devices",
      payload: {
        name: " Sensor 01 ",
        type: "TEMPERATURE",
        location: " Estufa A ",
      },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      name: "Sensor 01",
      type: "TEMPERATURE",
      location: "Estufa A",
      status: "ACTIVE",
    });

    const device = created.json<{ id: string }>();
    const list = await app
      .getServer()
      .inject({ method: "GET", url: "/devices" });
    const found = await app
      .getServer()
      .inject({ method: "GET", url: `/devices/${device.id}` });

    expect(list.statusCode).toBe(200);
    expect(list.json()).toHaveLength(1);
    expect(found.statusCode).toBe(200);
    expect(found.json()).toMatchObject({ id: device.id, name: "Sensor 01" });
  });

  it("returns 400 for invalid registration payloads", async () => {
    const app = createApp();
    const response = await app.getServer().inject({
      method: "POST",
      url: "/devices",
      payload: { name: "Sensor 01", type: "UNKNOWN", location: "Estufa A" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Bad Request",
      message: "Invalid request data.",
    });
  });

  it("returns 400 when required registration fields are missing", async () => {
    const app = createApp();
    const response = await app.getServer().inject({
      method: "POST",
      url: "/devices",
      payload: { name: "Sensor 01", type: "TEMPERATURE" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Bad Request",
      message: "Invalid request data.",
    });
  });

  it("returns 400 when the device name or location contains only whitespace", async () => {
    const app = createApp();
    const nameResponse = await app.getServer().inject({
      method: "POST",
      url: "/devices",
      payload: { name: "   ", type: "TEMPERATURE", location: "Estufa A" },
    });
    const locationResponse = await app.getServer().inject({
      method: "POST",
      url: "/devices",
      payload: { name: "Sensor 01", type: "TEMPERATURE", location: "   " },
    });

    expect(nameResponse.statusCode).toBe(400);
    expect(nameResponse.json()).toMatchObject({
      error: "Bad Request",
      message: "Device name cannot be empty.",
    });
    expect(locationResponse.statusCode).toBe(400);
    expect(locationResponse.json()).toMatchObject({
      error: "Bad Request",
      message: "Device location cannot be empty.",
    });
  });

  it("returns 404 when a device does not exist", async () => {
    const app = createApp();
    const response = await app.getServer().inject({
      method: "GET",
      url: "/devices/00000000-0000-4000-8000-000000000000",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ error: "Not Found" });
  });

  it("registers, fetches, and lists measurements for a device", async () => {
    const app = createApp();
    const deviceResponse = await app.getServer().inject({
      method: "POST", url: "/devices",
      payload: { name: "Sensor", type: "TEMPERATURE", location: "Lab" },
    });
    const device = deviceResponse.json<{ id: string }>();
    const payload = { deviceId: device.id, value: 21.75, recordedAt: "2026-11-19T10:00:00.000Z" };

    const created = await app.getServer().inject({ method: "POST", url: "/measurements", payload });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({ deviceId: device.id, value: 21.75, recordedAt: payload.recordedAt });

    const measurement = created.json<{ id: string }>();
    const found = await app.getServer().inject({ method: "GET", url: `/measurements/${measurement.id}` });
    const listed = await app.getServer().inject({ method: "GET", url: `/devices/${device.id}/measurements` });
    expect(found.statusCode).toBe(200);
    expect(found.json()).toMatchObject({ id: measurement.id, deviceId: device.id, value: 21.75 });
    expect(listed.statusCode).toBe(200);
    expect(listed.json()).toHaveLength(1);
    expect(listed.json()[0]).toMatchObject({ id: measurement.id, value: 21.75 });
  });

  it("returns 400 for invalid measurement payloads", async () => {
    const app = createApp();
    const response = await app.getServer().inject({
      method: "POST", url: "/measurements",
      payload: { deviceId: "bad-id", value: "hot", recordedAt: "yesterday" },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: "Bad Request", message: "Invalid request data." });
  });

  it("returns 404 for missing measurements and unknown devices in measurement lists", async () => {
    const app = createApp();
    const missingMeasurement = await app.getServer().inject({ method: "GET", url: "/measurements/00000000-0000-4000-8000-000000000000" });
    const missingDeviceList = await app.getServer().inject({ method: "GET", url: "/devices/00000000-0000-4000-8000-000000000000/measurements" });
    expect(missingMeasurement.statusCode).toBe(404);
    expect(missingDeviceList.statusCode).toBe(404);
  });
});
