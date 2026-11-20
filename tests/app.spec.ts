import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/app.js";
import { InMemoryDeviceRepository } from "../src/infrastructure/repositories/in-memory/in-memory-device-repository.js";
import { InMemoryMeasurementRepository } from "../src/infrastructure/repositories/in-memory/in-memory-measurement-repository.js";

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

  it("serves Swagger UI and documents API routes", async () => {
    const app = createApp();
    await app.getServer().ready();
    const docs = await app.getServer().inject({ method: "GET", url: "/docs" });
    const openapi = await app.getServer().inject({ method: "GET", url: "/docs/json" });

    expect(docs.statusCode).toBe(200);
    expect(docs.headers["content-type"]).toContain("text/html");
    expect(openapi.statusCode).toBe(200);
    expect(openapi.json()).toMatchObject({
      info: { title: "PulseGrid API", version: "1.0.0" },
      paths: {
        "/devices": { post: expect.any(Object), get: expect.any(Object) },
        "/measurements": { post: expect.any(Object) },
        "/measurements/{id}": { get: expect.any(Object) },
        "/devices/{deviceId}/measurements": { get: expect.any(Object) },
      },
    });
    const document = openapi.json<{
      paths: Record<
        string,
        Record<string, { responses: Record<string, unknown>; parameters?: unknown[] }>
      >;
    }>();
    expect(document.paths["/devices"].get.responses).toHaveProperty("200");
    expect(document.paths["/devices/{id}"].get.responses).toHaveProperty("404");
    expect(document.paths["/measurements/{id}"].get.responses).toMatchObject({
      200: expect.any(Object),
      404: expect.any(Object),
    });
    expect(document.paths["/devices/{deviceId}/measurements"].get.responses).toMatchObject({
      200: expect.any(Object),
      404: expect.any(Object),
    });
    expect(document.paths["/devices/{deviceId}/measurements"].get.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "limit", in: "query", schema: expect.objectContaining({ maximum: 100 }) }),
        expect.objectContaining({ name: "from", in: "query" }),
        expect.objectContaining({ name: "to", in: "query" }),
        expect.objectContaining({ name: "cursor", in: "query" }),
      ]),
    );
    expect(document.paths["/health"].get.responses).toHaveProperty("200");
    expect(document.paths["/ready"].get.responses).toMatchObject({
      200: expect.any(Object),
      503: expect.any(Object),
    });
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
    expect(listed.json()).toMatchObject({
      items: [expect.objectContaining({ id: measurement.id, value: 21.75 })],
      nextCursor: null,
      hasMore: false,
    });
  });

  it("paginates device measurements and applies inclusive time filters", async () => {
    const app = createApp();
    const deviceResponse = await app.getServer().inject({
      method: "POST", url: "/devices",
      payload: { name: "Sensor", type: "TEMPERATURE", location: "Lab" },
    });
    const device = deviceResponse.json<{ id: string }>();
    const recordedTimes = [
      "2026-11-01T00:00:00.000Z",
      "2026-11-10T12:00:00.000Z",
      "2026-11-20T00:00:00.000Z",
      "2026-11-21T00:00:00.000Z",
    ];

    for (const [index, recordedAt] of recordedTimes.entries()) {
      const created = await app.getServer().inject({
        method: "POST", url: "/measurements",
        payload: { deviceId: device.id, value: index, recordedAt },
      });
      expect(created.statusCode).toBe(201);
    }

    const firstPage = await app.getServer().inject({
      method: "GET",
      url: `/devices/${device.id}/measurements?limit=2&from=2026-11-01T00%3A00%3A00.000Z&to=2026-11-20T00%3A00%3A00.000Z`,
    });
    const firstPageBody = firstPage.json<{
      items: { recordedAt: string; id: string }[];
      nextCursor: string | null;
      hasMore: boolean;
    }>();

    expect(firstPage.statusCode).toBe(200);
    expect(firstPageBody.items.map((item) => item.recordedAt)).toEqual([
      "2026-11-20T00:00:00.000Z",
      "2026-11-10T12:00:00.000Z",
    ]);
    expect(firstPageBody.hasMore).toBe(true);
    expect(firstPageBody.nextCursor).toBeTruthy();

    const secondPage = await app.getServer().inject({
      method: "GET",
      url: `/devices/${device.id}/measurements?limit=2&from=2026-11-01T00%3A00%3A00.000Z&to=2026-11-20T00%3A00%3A00.000Z&cursor=${firstPageBody.nextCursor}`,
    });
    expect(secondPage.statusCode).toBe(200);
    expect(secondPage.json()).toMatchObject({
      items: [expect.objectContaining({ recordedAt: "2026-11-01T00:00:00.000Z" })],
      nextCursor: null,
      hasMore: false,
    });
  });

  it("validates measurement pagination query parameters", async () => {
    const app = createApp();
    const deviceResponse = await app.getServer().inject({
      method: "POST", url: "/devices",
      payload: { name: "Sensor", type: "TEMPERATURE", location: "Lab" },
    });
    const device = deviceResponse.json<{ id: string }>();
    const invalidLimit = await app.getServer().inject({
      method: "GET", url: `/devices/${device.id}/measurements?limit=101`,
    });
    const invalidDateRange = await app.getServer().inject({
      method: "GET", url: `/devices/${device.id}/measurements?from=2026-11-20T00%3A00%3A00Z&to=2026-11-01T00%3A00%3A00Z`,
    });
    const invalidCursor = await app.getServer().inject({
      method: "GET", url: `/devices/${device.id}/measurements?cursor=not-a-cursor`,
    });

    expect(invalidLimit.statusCode).toBe(400);
    expect(invalidDateRange.statusCode).toBe(400);
    expect(invalidCursor.statusCode).toBe(400);
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
